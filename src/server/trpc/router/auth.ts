import { env } from "../../../env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

const SpotifyTokenResponse = z.object({
  access_token: z.string(),
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
  console.log();
  const data = await res.json();
  console.log("refresh response");
  console.log(data);
  return SpotifyTokenResponse.parse(data);
}

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    console.log("GET SESSION");
    console.log(ctx.session);
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const account = await ctx.prisma.account.findFirst({
      where: { userId },
    })!;
    const { access_token } = await refreshToken(account?.refresh_token || "");
    console.log(account);
    const Authorization = `${account?.token_type} ${access_token}`;
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/users/${account.providerAccountId}/playlists`,
      {
        headers: {
          Authorization,
        },
      }
    );
    console.log(await spotifyResponse.json());
    return "Hello!";
  }),
});
