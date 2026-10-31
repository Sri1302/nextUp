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

export type User = InferSelectModel<typeof schema.users>;
export type Creator = InferSelectModel<typeof schema.creators>;
export type Item = InferSelectModel<typeof schema.items>;
export type ItemWithVotes = Item & { votes: number; voted: boolean };
