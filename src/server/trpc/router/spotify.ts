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

export type Playlist = z.infer<typeof PlaylistSchema>;

const UserPlaylistsResponse = ResourceResponse.extend({
  items: z.array(PlaylistSchema),
});

const TracksSchema = z
  .object({
    track: z
      .object({
        id: z.string(),
        name: z.string(),
        album: z.object({
          images: z.array(
            z.object({
              url: z.string(),
              height: z.number().nullable(),
              width: z.number().nullable(),
            })
          ),
        }),
      })
      .passthrough(),
  })
  .passthrough();

const PlaylistTracksResponse = ResourceResponse.extend({
  items: z.array(TracksSchema),
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
});
