import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";
import { env } from "../../env/server.mjs";
import { z } from "zod";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

const TokenResponse = z.object({
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
  const data = await res.json();
  return TokenResponse.parse(data);
}

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const userId = ctx.session.user.id;
  const account = await ctx.prisma.account.findFirstOrThrow({
    where: { userId },
  });
  const { access_token: accessToken } = await refreshToken(
    account.refresh_token || ""
  );

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user, accessToken },
    },
  });
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);
