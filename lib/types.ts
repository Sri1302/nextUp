// Shared types and constants, safe to import from client components.
import type { InferSelectModel } from "drizzle-orm";
import type * as schema from "./db/schema";

export const PLATFORMS = ["youtube", "instagram"] as const;
export const STATUSES = ["idea", "planned", "in_progress", "done"] as const;
export const PROVIDERS = ["google", "instagram"] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Status = (typeof STATUSES)[number];
export type Provider = (typeof PROVIDERS)[number];

export const STATUS_LABEL: Record<Status, string> = {
  idea: "Idea",
  planned: "Planned",
  in_progress: "In progress",
  done: "Done",
};

export const CATEGORIES = {
  tech: { label: "Tech", emoji: "💻" },
  food: { label: "Food", emoji: "🍳" },
  travel: { label: "Travel", emoji: "✈️" },
  gaming: { label: "Gaming", emoji: "🎮" },
  fitness: { label: "Fitness", emoji: "💪" },
  beauty: { label: "Beauty", emoji: "💄" },
  fashion: { label: "Fashion", emoji: "👗" },
  music: { label: "Music", emoji: "🎵" },
  education: { label: "Education", emoji: "📚" },
  comedy: { label: "Comedy", emoji: "😂" },
  lifestyle: { label: "Lifestyle", emoji: "🌿" },
  finance: { label: "Finance", emoji: "💰" },
  sports: { label: "Sports", emoji: "⚽" },
  entertainment: { label: "Entertainment", emoji: "🎬" },
  art: { label: "Art & DIY", emoji: "🎨" },
} as const;

export type Category = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
export const MAX_CATEGORIES = 3;

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && v in CATEGORIES;
}

// Creator page colour themes (page background, card surface, accent, text, muted text).
export const THEMES = {
  sage: { label: "Sage", bg: "#dfe9d6", card: "#ffffff", accent: "#2f6b45", text: "#13231a", muted: "#55665a", dark: false },
  sand: { label: "Sand", bg: "#efe4d4", card: "#fffaf3", accent: "#9a5b24", text: "#2a1d10", muted: "#76634f", dark: false },
  sky: { label: "Sky", bg: "#d9e8f5", card: "#ffffff", accent: "#1d5fa8", text: "#0f1f33", muted: "#52657a", dark: false },
  blush: { label: "Blush", bg: "#f5dfe5", card: "#fffafb", accent: "#b03a5b", text: "#2e1219", muted: "#7a5560", dark: false },
  lilac: { label: "Lilac", bg: "#e6defa", card: "#ffffff", accent: "#6a45f5", text: "#1b1336", muted: "#5f5679", dark: false },
  night: { label: "Night", bg: "#121214", card: "#1d1d21", accent: "#b9a2ff", text: "#f4f4f6", muted: "#a3a3ad", dark: true },
} as const;
export type ThemeKey = keyof typeof THEMES;
export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
export function isTheme(v: unknown): v is ThemeKey {
  return typeof v === "string" && v in THEMES;
}

export type User = InferSelectModel<typeof schema.users>;
export type Creator = InferSelectModel<typeof schema.creators>;
export type Item = InferSelectModel<typeof schema.items>;
export type ItemWithVotes = Item & { votes: number; voted: boolean };
