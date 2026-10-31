import crypto from "node:crypto";
import { env } from "../env";
import { categoriesFromYouTubeTopics } from "../categories";
import type { CreatorProfile, OAuthIdentity } from "../data";
import type { Provider } from "../types";

export type Intent = "creator" | "fan";

export type OAuthResult = {
  identity: OAuthIdentity;
  creator: CreatorProfile;
};

const config = {
  google: { id: env("GOOGLE_CLIENT_ID"), secret: env("GOOGLE_CLIENT_SECRET") },
  instagram: { id: env("INSTAGRAM_CLIENT_ID"), secret: env("INSTAGRAM_CLIENT_SECRET") },
};

export function isProvider(p: string): p is Provider {
  return p === "google" || p === "instagram";
}

export function isConfigured(p: Provider) {
  return !!(config[p].id && config[p].secret);
}

export const randomToken = () => crypto.randomBytes(32).toString("base64url");

const pkceChallenge = (verifier: string) => crypto.createHash("sha256").update(verifier).digest("base64url");

export function redirectUri(origin: string, provider: Provider) {
  return `${origin}/auth/${provider}/callback`;
}

export function authorizeUrl(provider: Provider, o: { origin: string; state: string; verifier: string; intent: Intent }) {
  if (provider === "google") {
    const scopes = ["openid", "email", "profile"];
    if (o.intent === "creator") scopes.push("https://www.googleapis.com/auth/youtube.readonly");
    const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    u.search = new URLSearchParams({
      client_id: config.google.id!,
      redirect_uri: redirectUri(o.origin, "google"),
      response_type: "code",
      scope: scopes.join(" "),
      state: o.state,
      code_challenge: pkceChallenge(o.verifier),
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
    return u.toString();
  }

  const u = new URL("https://www.instagram.com/oauth/authorize");
  u.search = new URLSearchParams({
    client_id: config.instagram.id!,
    redirect_uri: redirectUri(o.origin, "instagram"),
    response_type: "code",
    scope: "instagram_business_basic",
    state: o.state,
  }).toString();
  return u.toString();
}

async function json<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) throw new Error(`${what} failed: ${res.status} ${await res.text().catch(() => "")}`);
  return res.json() as Promise<T>;
}

export async function exchangeCode(
  provider: Provider,
  o: { origin: string; code: string; verifier: string; intent: Intent },
): Promise<OAuthResult> {
  return provider === "google" ? google(o) : instagram(o);
}

// ---- Google / YouTube ----

async function google(o: { origin: string; code: string; verifier: string; intent: Intent }): Promise<OAuthResult> {
  const token = await json<{ access_token: string }>(
    await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: o.code,
        client_id: config.google.id!,
        client_secret: config.google.secret!,
        redirect_uri: redirectUri(o.origin, "google"),
        grant_type: "authorization_code",
        code_verifier: o.verifier,
      }),
    }),
    "Google token exchange",
  );
  const auth = { Authorization: `Bearer ${token.access_token}` };

  const me = await json<{ sub: string; name?: string; email?: string; email_verified?: boolean; picture?: string }>(
    await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: auth }),
    "Google profile",
  );

  const identity: OAuthIdentity = {
    provider: "google",
    providerAccountId: me.sub,
    name: me.name ?? "",
    email: me.email_verified ? me.email : null,
    image: me.picture ?? null,
  };
  const creator: CreatorProfile = {
    name: me.name ?? "",
    platform: "youtube",
    suggestedHandle: me.name ?? "",
    channelUrl: "",
    avatarUrl: me.picture ?? "",
    followerCount: null,
    categories: [],
  };

  if (o.intent === "creator") {
    // The user may untick the YouTube permission; fall back to the Google profile then.
    try {
      const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,topicDetails&mine=true", {
        headers: auth,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          items?: {
            id: string;
            snippet: { title: string; customUrl?: string; thumbnails?: { medium?: { url: string }; default?: { url: string } } };
            statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
            topicDetails?: { topicCategories?: string[] };
          }[];
        };
        const ch = data.items?.[0];
        if (ch) {
          creator.name = ch.snippet.title;
          creator.suggestedHandle = ch.snippet.customUrl ?? ch.snippet.title;
          creator.channelUrl = ch.snippet.customUrl
            ? `https://www.youtube.com/${ch.snippet.customUrl}`
            : `https://www.youtube.com/channel/${ch.id}`;
          creator.avatarUrl = ch.snippet.thumbnails?.medium?.url ?? ch.snippet.thumbnails?.default?.url ?? creator.avatarUrl;
          const subs = Number(ch.statistics?.subscriberCount);
          creator.followerCount = ch.statistics?.hiddenSubscriberCount || !Number.isFinite(subs) ? null : subs;
          creator.categories = categoriesFromYouTubeTopics(ch.topicDetails?.topicCategories);
        }
      }
    } catch (err) {
      console.warn("YouTube channel lookup failed", err);
    }
  }

  return { identity, creator };
}

// ---- Instagram (Instagram API with Instagram Login; Business/Creator accounts) ----

async function instagram(o: { origin: string; code: string }): Promise<OAuthResult> {
  const raw = await json<{ access_token?: string; data?: { access_token: string }[] }>(
    await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.instagram.id!,
        client_secret: config.instagram.secret!,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(o.origin, "instagram"),
        code: o.code,
      }),
    }),
    "Instagram token exchange",
  );
  const accessToken = raw.access_token ?? raw.data?.[0]?.access_token;
  if (!accessToken) throw new Error("Instagram token exchange returned no token");

  const fields = "user_id,username,name,profile_picture_url,followers_count";
  const me = await json<{
    user_id?: string;
    id: string;
    username: string;
    name?: string;
    profile_picture_url?: string;
    followers_count?: number;
  }>(
    await fetch(`https://graph.instagram.com/me?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`),
    "Instagram profile",
  );

  const name = me.name || me.username;
  return {
    identity: {
      provider: "instagram",
      providerAccountId: me.user_id ?? me.id,
      name,
      image: me.profile_picture_url ?? null,
    },
    creator: {
      name,
      platform: "instagram",
      suggestedHandle: me.username,
      channelUrl: `https://www.instagram.com/${me.username}/`,
      avatarUrl: me.profile_picture_url ?? "",
      followerCount: me.followers_count ?? null,
      categories: [], // Instagram doesn't expose a niche; creators pick it themselves
    },
  };
}
