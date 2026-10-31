import { sql } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { PLATFORMS, PROVIDERS, STATUSES } from "../types";

export const platformEnum = pgEnum("platform", PLATFORMS);
export const statusEnum = pgEnum("item_status", STATUSES);
export const providerEnum = pgEnum("auth_provider", PROVIDERS);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Everyone who signs in: creators and fans.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default(""),
  email: text("email"),
  image: text("image"),
  createdAt: createdAt(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("accounts_provider_uid").on(t.provider, t.providerAccountId), index("accounts_user_idx").on(t.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256 of the cookie token, never the token itself
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(),
  name: text("name").notNull(),
  platform: platformEnum("platform").notNull(),
  channelUrl: text("channel_url").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),
  followerCount: integer("follower_count"),
  categories: text("categories").array().notNull().default(sql`'{}'::text[]`), // keys of CATEGORIES
  createdAt: createdAt(),
});

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: statusEnum("status").notNull().default("idea"),
    targetMonth: text("target_month").notNull().default(""), // "YYYY-MM" or ""
    doneUrl: text("done_url").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("items_creator_idx").on(t.creatorId)],
);

export const votes = pgTable(
  "votes",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.userId] }), index("votes_user_idx").on(t.userId)],
);
