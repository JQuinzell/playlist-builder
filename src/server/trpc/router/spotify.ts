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
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      })
    ),
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

async function refreshToken(refresh_token: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  const data = await res.json();
  // console.log("refresh response");
  // console.log(data);
  return TokenResponse.parse(data);
}

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
  return playlists;
}
export const spotifyRouter = router({
  search: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const account = await ctx.prisma.account.findFirstOrThrow({
      where: { userId },
    });
    const { access_token: accessToken } = await refreshToken(
      account.refresh_token || ""
    );
    const params = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    const { access_token } = await refreshToken(account.refresh_token || "");
    return getPlaylists(access_token, account.providerAccountId);
  }),
  getPlaylistTracks: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const account = await ctx.prisma.account.findFirstOrThrow({
        where: { userId },
      });
      const { access_token: accessToken } = await refreshToken(
        account.refresh_token || ""
      );
      const params = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    .input(z.array(SourceSchema))
    .query(async ({ ctx, input: sources }) => {
      const userId = ctx.session.user.id;
      const account = await ctx.prisma.account.findFirstOrThrow({
        where: { userId },
      });
      const { access_token: accessToken } = await refreshToken(
        account.refresh_token || ""
      );
      const params = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const tracks = await Promise.all(
        sources.map(async ({ id, type }) => {
          const spotifyResponse = await fetch(
            `https://api.spotify.com/v1/${type}s/${id}/tracks`,
            params
          );
          const json = await spotifyResponse.json();
          if (type === "album") {
            const albumResponse = await fetch(
              `https://api.spotify.com/v1/albums/${id}`,
              params
            );
            const album = AlbumSchema.parse(await albumResponse.json());
            const data = AlbumTracksResponse.parse(json);
            return data.items.map((item) => ({
              ...item,
              images: album.images,
            }));
          } else {
            const data = PlaylistTracksResponse.parse(json);
            return data.items.map(({ track }) => ({
              ...track,
              images: track.album.images,
            }));
          }
        })
      );
      const dedupedTracks = new Map(
        tracks.flat().map((track) => [track.id, track])
      );
      return Array.from(dedupedTracks.values());
    }),
});
