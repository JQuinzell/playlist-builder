import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  PlaylistSchema,
  UserPlaylistsResponse,
  SearchResponse,
  PlaylistTracksResponse,
  AlbumTracksResponse,
  HistoryResponse,
  TracksResponse,
  SourceInputSchema,
} from "./schemas";

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
    .input(SourceInputSchema.extend({ cursor: z.number().optional() }))
    .output(TracksResponse.extend({ next: z.number().optional() }))
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
        const data = AlbumTracksResponse.parse(json);
        return {
          ...data,
          next: data.next ? cursor + 1 : undefined,
        };
      } else {
        const data = PlaylistTracksResponse.parse(json);
        const items = data.items.map(({ track }) => track);
        return {
          ...data,
          items,
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
  getRecentlyPlayed: protectedProcedure.query(async ({ ctx }) => {
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?${new URLSearchParams(
        {
          limit: "50",
          before: Date.now().toString(),
        }
      )}`,
      {
        headers: {
          Authorization: `Bearer ${ctx.session.accessToken}`,
        },
      }
    );
    const data = HistoryResponse.parse(await spotifyResponse.json());
    return data.items;
  }),
});
