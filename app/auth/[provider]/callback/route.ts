import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_COOKIE, appOrigin, finishSignIn, type OAuthState } from "@/lib/auth/flow";
import { exchangeCode, isProvider } from "@/lib/auth/oauth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = appOrigin(req);
  const fail = (code: string) => {
    const res = NextResponse.redirect(new URL(`/?error=${code}`, origin));
    res.cookies.delete(OAUTH_COOKIE);
    return res;
  };

  let saved: OAuthState | undefined;
  try {
    saved = JSON.parse(req.cookies.get(OAUTH_COOKIE)?.value ?? "");
  } catch {
    // missing or malformed cookie: handled below
  }

  const q = req.nextUrl.searchParams;
  if (!isProvider(provider) || !saved || saved.provider !== provider) return fail("expired");
  if (q.get("error")) return fail("denied");
  const code = q.get("code");
  if (!code || q.get("state") !== saved.state) return fail("expired");

  try {
    const result = await exchangeCode(provider, { origin, code, verifier: saved.verifier, intent: saved.intent });
    return await finishSignIn(req, { ...result, intent: saved.intent, returnTo: saved.returnTo });
  } catch (err) {
    console.error(`OAuth callback failed for ${provider}`, err);
    return fail("signin_failed");
  }
}
