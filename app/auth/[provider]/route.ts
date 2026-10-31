import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_COOKIE, appOrigin, safeReturnTo, type OAuthState } from "@/lib/auth/flow";
import { authorizeUrl, isConfigured, isProvider, randomToken } from "@/lib/auth/oauth";
import { secureCookies } from "@/lib/auth/session";

// GET /auth/google?intent=creator|fan&returnTo=/@handle starts the OAuth flow.
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = appOrigin(req);
  if (!isProvider(provider)) return new NextResponse("Not found", { status: 404 });

  const intent = req.nextUrl.searchParams.get("intent") === "fan" ? "fan" : "creator";
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));

  // Fans vote with Google; Instagram login is only for creators.
  if (provider === "instagram" && intent === "fan") return NextResponse.redirect(new URL(returnTo, origin));
  if (!isConfigured(provider)) {
    if (process.env.NODE_ENV === "development") {
      const dev = new URL("/auth/dev", origin);
      dev.search = new URLSearchParams({ intent, returnTo }).toString();
      return NextResponse.redirect(dev);
    }
    return NextResponse.redirect(new URL("/?error=not_configured", origin));
  }

  const state: OAuthState = { provider, state: randomToken(), verifier: randomToken(), intent, returnTo };
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
