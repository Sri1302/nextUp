import { detectNiche } from "./categories";
import { env } from "./env";
import type { Category } from "./types";

export type YouTubeChannel = {
  id: string;
  name: string;
  handle: string; // "@name" when the channel has one
  url: string;
  avatarUrl: string;
  followerCount: number | null;
  categories: Category[];
};

export const youtubeLookupEnabled = () => !!env("YOUTUBE_API_KEY");

// Accepts "@name", "name", a youtube.com/@name or /channel/UC… link, or a bare UC… id.
export function parseChannelInput(raw: string): { forHandle: string } | { id: string } | null {
  const s = raw.trim();
  if (!s) return null;
  const id = s.match(/(?:^|\/channel\/)(UC[\w-]{22})(?:[/?#]|$)/);
  if (id) return { id: id[1] };
  const at = s.match(/(?:youtube\.com\/)?@([\w.-]{3,30})/i);
  if (at) return { forHandle: `@${at[1]}` };
  if (/^[\w.-]{3,30}$/.test(s)) return { forHandle: `@${s}` };
  return null;
}

type Auth = { key: string } | { token: string };

// GET a YouTube Data API endpoint with either an API key (public data) or the user's access token.
async function yt<T>(path: string, params: Record<string, string>, auth: Auth): Promise<T | null> {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  u.search = new URLSearchParams({ ...params, ...("key" in auth ? { key: auth.key } : {}) }).toString();
  const res = await fetch(u, {
    cache: "no-store",
    headers: "token" in auth ? { Authorization: `Bearer ${auth.token}` } : undefined,
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

type ChannelItem = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    customUrl?: string;
    thumbnails?: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
  topicDetails?: { topicCategories?: string[] };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
  brandingSettings?: { channel?: { keywords?: string } };
};

const CHANNEL_PARTS = "snippet,statistics,topicDetails,contentDetails,brandingSettings";

// Public channel data via the YouTube Data API (API key, no user permission needed).
export async function lookupChannel(raw: string): Promise<YouTubeChannel | null> {
  const key = env("YOUTUBE_API_KEY");
  const q = parseChannelInput(raw);
  if (!key || !q) return null;
  const auth = { key };
  const data = await yt<{ items?: ChannelItem[] }>("channels", { part: CHANNEL_PARTS, ...q }, auth);
  if (!data) throw new Error("YouTube lookup failed");
  return toChannel(data.items?.[0], auth);
}

// The signed-in user's own channel (needs the youtube.readonly permission from sign-in).
export async function fetchMyChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const auth = { token: accessToken };
  const data = await yt<{ items?: ChannelItem[] }>("channels", { part: CHANNEL_PARTS, mine: "true" }, auth);
  return toChannel(data?.items?.[0], auth); // null if permission not granted or no channel
}

// YouTube category ids of the channel's most recent uploads (a strong niche signal).
async function recentVideoCategories(uploads: string | undefined, auth: Auth): Promise<string[]> {
  if (!uploads) return [];
  const list = await yt<{ items?: { contentDetails?: { videoId?: string } }[] }>(
    "playlistItems",
    { part: "contentDetails", playlistId: uploads, maxResults: "10" },
    auth,
  );
  const ids = (list?.items ?? []).map((i) => i.contentDetails?.videoId).filter(Boolean) as string[];
  if (!ids.length) return [];
  const videos = await yt<{ items?: { snippet?: { categoryId?: string } }[] }>("videos", { part: "snippet", id: ids.join(",") }, auth);
  return (videos?.items ?? []).map((v) => v.snippet?.categoryId).filter(Boolean) as string[];
}

async function toChannel(ch: ChannelItem | undefined, auth: Auth): Promise<YouTubeChannel | null> {
  if (!ch) return null;
  const th = ch.snippet.thumbnails;
  const subs = Number(ch.statistics?.subscriberCount);
  const handle = ch.snippet.customUrl ?? "";
  const videoCategoryIds = await recentVideoCategories(ch.contentDetails?.relatedPlaylists?.uploads, auth).catch(() => []);
  return {
    id: ch.id,
    name: ch.snippet.title,
    handle,
    url: handle ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/channel/${ch.id}`,
    avatarUrl: th?.high?.url ?? th?.medium?.url ?? th?.default?.url ?? "",
    followerCount: ch.statistics?.hiddenSubscriberCount || !Number.isFinite(subs) ? null : subs,
    categories: detectNiche({
      topicUrls: ch.topicDetails?.topicCategories,
      videoCategoryIds,
      text: [ch.snippet.title, ch.snippet.description, ch.brandingSettings?.channel?.keywords].filter(Boolean).join("\n"),
    }),
  };
}
