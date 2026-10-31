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

export type User = InferSelectModel<typeof schema.users>;
export type Creator = InferSelectModel<typeof schema.creators>;
export type Item = InferSelectModel<typeof schema.items>;
export type ItemWithVotes = Item & { votes: number; voted: boolean };
