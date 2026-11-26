import { NextResponse, type NextRequest } from "next/server";
import { addItem, ensureCreator, setCreatorTheme, type CreatorProfile, type OAuthIdentity, upsertOAuthUser } from "../data";
import { isTheme } from "../types";
import type { Intent } from "./oauth";
import { createSession } from "./session";
import { appUrl } from "../env";

export const OAUTH_COOKIE = "nu_oauth";

export type OAuthState = {
  provider: string;
  state: string;
  verifier: string;
  intent: Intent;
  handle?: string; // handle typed into "claim your link", used for brand-new creators
  theme?: string; // colour picked in the homepage preview
  ideas?: string[]; // ideas typed into the homepage preview
  returnTo: string;
};

// Only same-site paths, so the login flow can't be used as an open redirect.
export function safeReturnTo(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  return raw;
}

// Up to 3 short, non-empty idea titles from the homepage preview.
export function cleanIdeas(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => String(s).replace(/\s+/g, " ").trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 3);
}

// The site's public origin, used for OAuth redirect URIs. APP_URL wins over request headers.
export function appOrigin(req: NextRequest) {
  return appUrl() || req.nextUrl.origin;
}

// Shared tail of every sign-in: user, session, creator profile, then where to go next.
export async function finishSignIn(
  req: NextRequest,
  o: {
    identity: OAuthIdentity;
    creator: CreatorProfile;
    intent: Intent;
    returnTo: string;
    handle?: string;
    theme?: string;
    ideas?: string[];
  },
) {
  const userId = await upsertOAuthUser(o.identity);
  await createSession(userId);

  let dest = o.returnTo;
  if (o.intent === "creator") {
    const { creator, isNew } = await ensureCreator(userId, o.handle ? { ...o.creator, suggestedHandle: o.handle } : o.creator);
    // A brand-new page starts with whatever the visitor set up in the homepage preview.
    if (isNew) {
      if (isTheme(o.theme)) await setCreatorTheme(creator.id, o.theme);
      for (const title of cleanIdeas(o.ideas)) {
        await addItem(creator.id, { title, description: "", status: "idea", targetMonth: "", doneUrl: "" });
      }
    }
    dest = isNew ? "/dashboard?welcome=1" : "/dashboard";
  }
  const res = NextResponse.redirect(new URL(dest, appOrigin(req)));
  res.cookies.delete(OAUTH_COOKIE);
  return res;
}
