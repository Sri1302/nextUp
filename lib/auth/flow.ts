import { NextResponse, type NextRequest } from "next/server";
import { ensureCreator, type CreatorProfile, type OAuthIdentity, upsertOAuthUser } from "../data";
import type { Intent } from "./oauth";
import { createSession } from "./session";

export const OAUTH_COOKIE = "nu_oauth";

export type OAuthState = {
  provider: string;
  state: string;
  verifier: string;
  intent: Intent;
  returnTo: string;
};

// Only same-site paths, so the login flow can't be used as an open redirect.
export function safeReturnTo(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  return raw;
}

// The site's public origin, used for OAuth redirect URIs. APP_URL wins over request headers.
export function appOrigin(req: NextRequest) {
  return process.env.APP_URL?.replace(/\/$/, "") || req.nextUrl.origin;
}

// Shared tail of every sign-in: user, session, creator profile, then where to go next.
export async function finishSignIn(
  req: NextRequest,
  o: { identity: OAuthIdentity; creator: CreatorProfile; intent: Intent; returnTo: string },
) {
  const userId = await upsertOAuthUser(o.identity);
  await createSession(userId);

  let dest = o.returnTo;
  if (o.intent === "creator") {
    const { isNew } = await ensureCreator(userId, o.creator);
    dest = isNew ? "/dashboard?welcome=1" : "/dashboard";
  }
  const res = NextResponse.redirect(new URL(dest, appOrigin(req)));
  res.cookies.delete(OAUTH_COOKIE);
  return res;
}
