import { env } from "../../../env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

const ResourceResponse = z.object({
  href: z.string(),
  limit: z.number(),
  next: z.string().nullable(),
  offset: z.number(),
  // previous: null,
  total: z.number(),
});

const TokenResponse = z.object({
  access_token: z.string(),
});

// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
const PlaylistSchema = z
  .object({
    description: z.string().nullable(),
    external_urls: z.object({ spotify: z.string() }),
    href: z.string(),
    id: z.string(),
    snapshot_id: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      })
    ),
    owner: z.object({
      display_name: z.string(),
      id: z.string(),
      type: z.string(),
      uri: z.string(),
    }),
    name: z.string(),
    // tracks: z.object({href:z.string()}),
    type: z.literal("playlist"),
    // uri: z.string(),
  })
  // TODO: will probably remove passThrough eventually?
  .passthrough();

const AlbumSchema = z
  .object({
    id: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      })
    ),
    name: z.string(),
    // tracks: z.object({href:z.string()}),
    type: z.literal("album"),
    // uri: z.string(),
  })
  // TODO: will probably remove passThrough eventually?
  .passthrough();

const AlbumResponse = ResourceResponse.extend({
  items: z.array(AlbumSchema),
});

export type Playlist = z.infer<typeof PlaylistSchema>;

const UserPlaylistsResponse = ResourceResponse.extend({
  items: z.array(PlaylistSchema),
});

const TracksSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

const TracksRespone = ResourceResponse.extend({
  items: z.array(TracksSchema),
});

const SearchResponse = z
  .object({
    playlists: UserPlaylistsResponse,
    albums: AlbumResponse,
  })
  .passthrough();

const PlaylistTracksResponse = ResourceResponse.extend({
  items: z.array(
    z.object({
      track: TracksSchema.extend({
        album: z.object({
          images: z.array(
            z.object({
              url: z.string(),
              height: z.number().nullable(),
              width: z.number().nullable(),
            })
          ),
        }),
      }),
    })
  ),
});

const AlbumTracksResponse = ResourceResponse.extend({
  items: z.array(TracksSchema),
});

const SourceSchema = z.object({
  id: z.string(),
  type: z.enum([AlbumSchema.shape.type.value, PlaylistSchema.shape.type.value]),
});

async function getPlaylists(accessToken: string, accountId: string) {
  const params = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  let next:
    | string
    | null = `https://api.spotify.com/v1/users/${accountId}/playlists`;
  const playlists: Array<z.infer<typeof PlaylistSchema>> = [];
  do {
    const spotifyResponse = await fetch(next, params);
    const data = UserPlaylistsResponse.parse(await spotifyResponse.json());
    playlists.push(...data.items);
    next = data.next;
  } while (next);
  return playlists.filter(({ owner }) => owner.id === accountId);
}

export const spotifyRouter = router({
  search: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const params = {
      headers: {
        Authorization: `Bearer ${ctx.session.accessToken}`,
      },
    };
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: input,
        type: "album,playlist",
      })}`,
      params
    );
    const data = SearchResponse.parse(await spotifyResponse.json());
    return data;
  }),

  getPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const account = await ctx.prisma.account.findFirstOrThrow({
      where: { userId },
    });
    return getPlaylists(ctx.session.accessToken, account.providerAccountId);
  }),
  getPlaylistTracks: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${ctx.session.accessToken}`,
        },
      };
      const spotifyResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${input}/tracks`,
        params
      );
      const json = await spotifyResponse.json();
      const data = PlaylistTracksResponse.parse(json);
      return data.items;
    }),
  getSourceTracks: protectedProcedure
    .input(SourceSchema.extend({ cursor: z.number().optional() }))
    .query(async ({ ctx, input: source }) => {
      const params = {
        headers: {
          Authorization: `Bearer ${ctx.session.accessToken}`,
        },
      };
      const { type, id, cursor = 0 } = source;
      const limit = 20;
      const offset = cursor * limit;
      const spotifyResponse = await fetch(
        `https://api.spotify.com/v1/${type}s/${id}/tracks?offset=${offset}&limit=${limit}`,
        params
      );
      const json = await spotifyResponse.json();
      if (type === "album") {
        const albumResponse = await fetch(
          `https://api.spotify.com/v1/albums/${id}?offset=${offset}&limit=${limit}`,
          params
        );
        const album = AlbumSchema.parse(await albumResponse.json());
        const data = AlbumTracksResponse.parse(json);
        return {
          ...data,
          items: data.items.map((item) => ({
            ...item,
            images: album.images,
          })),
          next: data.next ? cursor + 1 : undefined,
        };
      } else {
        const data = PlaylistTracksResponse.parse(json);
        return {
          ...data,
          items: data.items.map(({ track }) => ({
            ...track,
            images: track.album.images,
          })),
          next: data.next ? cursor + 1 : undefined,
        };
      }
    }),
  addTrackToPlaylist: protectedProcedure
    .input(z.object({ playlistId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const spotifyResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${
          input.playlistId
        }/tracks?=${new URLSearchParams({
          uris: `spotify:track:${input.id}`,
        })}`,
        {
          headers: {
            Authorization: `Bearer ${ctx.session.accessToken}`,
          },
          method: "POST",
        }
      );
      const data = await spotifyResponse.json();
      if (data.error) throw new Error(data.error.message);
    }),
  removeTrackToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        trackId: z.string(),
        snapshotId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const spotifyResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${input.playlistId}/tracks`,
        {
          body: JSON.stringify({
            tracks: [
              {
                uri: `spotify:track:${input.trackId}`,
              },
            ],
            snapshot_id: input.snapshotId,
          }),
          headers: {
            Authorization: `Bearer ${ctx.session.accessToken}`,
          },
          method: "DELETE",
        }
      );
      const data = await spotifyResponse.json();
      if (data.error) throw new Error(data.error.message);
    }),
});
