import { categoriesFromYouTubeTopics } from "./categories";
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

// Public channel data via the YouTube Data API (API key, no user permission needed).
export async function lookupChannel(raw: string): Promise<YouTubeChannel | null> {
  const key = env("YOUTUBE_API_KEY");
  const q = parseChannelInput(raw);
  if (!key || !q) return null;
  const u = new URL("https://www.googleapis.com/youtube/v3/channels");
  u.search = new URLSearchParams({ part: "snippet,statistics,topicDetails", key, ...q }).toString();
  const res = await fetch(u, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube lookup failed: ${res.status}`);
  return firstChannel(await res.json());
}

// The signed-in user's own channel (needs the youtube.readonly permission from sign-in).
export async function fetchMyChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,topicDetails&mine=true", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null; // permission not granted, or no channel
  return firstChannel(await res.json());
}

type ChannelsResponse = {
  items?: {
    id: string;
    snippet: { title: string; customUrl?: string; thumbnails?: { high?: { url: string }; medium?: { url: string }; default?: { url: string } } };
    statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
    topicDetails?: { topicCategories?: string[] };
  }[];
};

function firstChannel(data: ChannelsResponse): YouTubeChannel | null {
  const ch = data.items?.[0];
  if (!ch) return null;
  const th = ch.snippet.thumbnails;
  const subs = Number(ch.statistics?.subscriberCount);
  const handle = ch.snippet.customUrl ?? "";
  return {
    id: ch.id,
    name: ch.snippet.title,
    handle,
    url: handle ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/channel/${ch.id}`,
    avatarUrl: th?.high?.url ?? th?.medium?.url ?? th?.default?.url ?? "",
    followerCount: ch.statistics?.hiddenSubscriberCount || !Number.isFinite(subs) ? null : subs,
    categories: categoriesFromYouTubeTopics(ch.topicDetails?.topicCategories),
  };
}
