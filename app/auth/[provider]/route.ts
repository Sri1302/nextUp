import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_COOKIE, appOrigin, cleanIdeas, safeReturnTo, type OAuthState } from "@/lib/auth/flow";
import { isTheme } from "@/lib/types";
import { authorizeUrl, isConfigured, isProvider, randomToken } from "@/lib/auth/oauth";
import { handleError, normalizeHandle } from "@/lib/data";
import { secureCookies } from "@/lib/auth/session";

// GET /auth/google?intent=creator|fan&returnTo=/@handle starts the OAuth flow.
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = appOrigin(req);
  if (!isProvider(provider)) return new NextResponse("Not found", { status: 404 });

  const intent = req.nextUrl.searchParams.get("intent") === "fan" ? "fan" : "creator";
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  const wanted = normalizeHandle(req.nextUrl.searchParams.get("handle") ?? "");
  const handle = intent === "creator" && wanted && !handleError(wanted) ? wanted : undefined;
  const sp = req.nextUrl.searchParams;
  const theme = intent === "creator" && isTheme(sp.get("theme")) ? (sp.get("theme") as string) : undefined;
  const ideas = intent === "creator" ? cleanIdeas(sp.getAll("idea")) : [];

  // Fans vote with Google; Instagram login is only for creators.
  if (provider === "instagram" && intent === "fan") return NextResponse.redirect(new URL(returnTo, origin));
  if (!isConfigured(provider)) {
    if (process.env.NODE_ENV === "development") {
      const dev = new URL("/auth/dev", origin);
      const p = new URLSearchParams({ intent, returnTo, ...(handle ? { handle } : {}), ...(theme ? { theme } : {}) });
      ideas.forEach((i) => p.append("idea", i));
      dev.search = p.toString();
      return NextResponse.redirect(dev);
    }
    return NextResponse.redirect(new URL("/?error=not_configured", origin));
  }

  const state: OAuthState = { provider, state: randomToken(), verifier: randomToken(), intent, returnTo, handle, theme, ideas };
  const res = NextResponse.redirect(authorizeUrl(provider, { origin, ...state }));
  res.cookies.set(OAUTH_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    secure: secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
