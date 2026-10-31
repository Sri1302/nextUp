import { NextResponse, type NextRequest } from "next/server";
import { finishSignIn, safeReturnTo } from "@/lib/auth/flow";

// Local-only sign-in so the app can be tried before Google/Instagram keys exist.
// GET /auth/dev?intent=creator|fan&as=<name>&returnTo=/@handle
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new NextResponse("Not found", { status: 404 });

  const q = req.nextUrl.searchParams;
  const intent = q.get("intent") === "fan" ? "fan" : "creator";
  const as = (q.get("as") || (intent === "fan" ? "Test Fan" : "Test Creator")).slice(0, 40);

  return finishSignIn(req, {
    identity: { provider: "google", providerAccountId: `dev:${as}`, name: as },
    creator: {
      name: as,
      platform: "youtube",
      suggestedHandle: as,
      channelUrl: "",
      avatarUrl: "",
      followerCount: null,
    },
    intent,
    returnTo: safeReturnTo(q.get("returnTo")),
  });
}
