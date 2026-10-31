import { and, desc, eq, getTableColumns, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { accounts, creators, items, users, votes } from "./db/schema";
import type { Creator, Item, ItemWithVotes, Platform, Provider } from "./types";

// ---- handles ----

const RESERVED = new Set([
  "admin", "api", "app", "auth", "dashboard", "demo", "explore", "help", "login", "logout",
  "nextup", "privacy", "settings", "signin", "signup", "support", "terms", "www",
]);

export function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 30);
}

export function handleError(handle: string) {
  if (!/^[a-z0-9._]{3,30}$/.test(handle)) return "Handles are 3–30 characters: letters, numbers, dots or underscores.";
  if (RESERVED.has(handle)) return "That handle is reserved, try another.";
  return null;
}

async function handleTaken(handle: string, exceptCreatorId?: string) {
  const db = await getDb();
  const rows = await db
    .select({ id: creators.id })
    .from(creators)
    .where(exceptCreatorId ? and(eq(creators.handle, handle), ne(creators.id, exceptCreatorId)) : eq(creators.handle, handle))
    .limit(1);
  return rows.length > 0;
}

async function uniqueHandle(base: string) {
  let root = normalizeHandle(base);
  if (root.length < 3) root = `${root}creator`.slice(0, 30);
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? root : `${root.slice(0, 26)}${n + 1}`;
    if (!handleError(candidate) && !(await handleTaken(candidate))) return candidate;
  }
  return `${root.slice(0, 20)}${Math.floor(Math.random() * 1e8)}`;
}

// ---- users ----

export type OAuthIdentity = {
  provider: Provider;
  providerAccountId: string;
  name: string;
  email?: string | null;
  image?: string | null;
};

// Finds or creates the user behind an OAuth account. Accounts are never linked by
// email automatically, so one provider can't be used to take over another's user.
export async function upsertOAuthUser(id: OAuthIdentity) {
  const db = await getDb();
  const profile = { name: id.name, email: id.email ?? null, image: id.image ?? null };

  const findAccount = () =>
    db
      .select({ userId: accounts.userId })
      .from(accounts)
      .where(and(eq(accounts.provider, id.provider), eq(accounts.providerAccountId, id.providerAccountId)))
      .limit(1);

  const [existing] = await findAccount();
  if (existing) {
    await db.update(users).set(profile).where(eq(users.id, existing.userId));
    return existing.userId;
  }

  const [user] = await db.insert(users).values(profile).returning({ id: users.id });
  const linked = await db
    .insert(accounts)
    .values({ userId: user.id, provider: id.provider, providerAccountId: id.providerAccountId })
    .onConflictDoNothing()
    .returning({ id: accounts.id });
  if (linked.length) return user.id;

  // Lost a race with a parallel sign-in for the same account.
  await db.delete(users).where(eq(users.id, user.id));
  const [winner] = await findAccount();
  return winner.userId;
}

export async function deleteUser(userId: string) {
  const db = await getDb();
  await db.delete(users).where(eq(users.id, userId));
}

// ---- creators ----

export async function getCreatorByHandle(handle: string): Promise<Creator | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(creators).where(eq(creators.handle, normalizeHandle(handle))).limit(1);
  return row;
}

export type CreatorListing = Pick<
  Creator,
  "id" | "handle" | "name" | "platform" | "avatarUrl" | "followerCount" | "bio"
> & { itemCount: number; voteCount: number };

// Creators with something on their timeline, most-voted first. Optional search by name or handle.
export async function listCreators(search = "", limit = 48): Promise<CreatorListing[]> {
  const db = await getDb();
  const q = search.trim().slice(0, 60).replace(/[\\%_]/g, (c) => `\\${c}`);
  const voteCount = sql<number>`count(${votes.userId})::int`;
  return db
    .select({
      id: creators.id,
      handle: creators.handle,
      name: creators.name,
      platform: creators.platform,
      avatarUrl: creators.avatarUrl,
      followerCount: creators.followerCount,
      bio: creators.bio,
      itemCount: sql<number>`count(distinct ${items.id})::int`,
      voteCount,
    })
    .from(creators)
    .innerJoin(items, eq(items.creatorId, creators.id))
    .leftJoin(votes, eq(votes.itemId, items.id))
    .where(q ? or(ilike(creators.name, `%${q}%`), ilike(creators.handle, `%${q}%`)) : undefined)
    .groupBy(creators.id)
    .orderBy(desc(voteCount), desc(creators.createdAt))
    .limit(limit);
}

export async function getCreatorByUserId(userId: string): Promise<Creator | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(creators).where(eq(creators.userId, userId)).limit(1);
  return row;
}

export type CreatorProfile = {
  name: string;
  platform: Platform;
  suggestedHandle: string;
  channelUrl: string;
  avatarUrl: string;
  followerCount: number | null;
};

// Creates the creator profile on first sign-in, or refreshes the platform data on later ones.
export async function ensureCreator(userId: string, p: CreatorProfile) {
  const db = await getDb();
  const current = await getCreatorByUserId(userId);
  if (current) {
    await db
      .update(creators)
      .set({
        avatarUrl: p.avatarUrl || current.avatarUrl,
        followerCount: p.followerCount ?? current.followerCount,
        channelUrl: current.channelUrl || p.channelUrl,
      })
      .where(eq(creators.id, current.id));
    return { creator: current, isNew: false };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const handle = await uniqueHandle(p.suggestedHandle || p.name);
    const [created] = await db
      .insert(creators)
      .values({
        userId,
        handle,
        name: p.name.slice(0, 60) || handle,
        platform: p.platform,
        channelUrl: p.channelUrl,
        avatarUrl: p.avatarUrl,
        followerCount: p.followerCount,
      })
      .onConflictDoNothing()
      .returning();
    if (created) return { creator: created, isNew: true };
    const raced = await getCreatorByUserId(userId);
    if (raced) return { creator: raced, isNew: false };
  }
  throw new Error("Could not create creator profile");
}

export async function updateCreator(
  creatorId: string,
  patch: Pick<Creator, "handle" | "name" | "platform" | "channelUrl" | "bio">,
) {
  const err = handleError(patch.handle);
  if (err) return err;
  if (await handleTaken(patch.handle, creatorId)) return "That handle is already taken.";
  const db = await getDb();
  try {
    await db.update(creators).set(patch).where(eq(creators.id, creatorId));
  } catch {
    return "That handle is already taken.";
  }
  return null;
}

// ---- items ----

export async function getItems(creatorId: string, viewerId?: string): Promise<ItemWithVotes[]> {
  const db = await getDb();
  const rows = await db
    .select({ ...getTableColumns(items), votes: sql<number>`count(${votes.userId})::int` })
    .from(items)
    .leftJoin(votes, eq(votes.itemId, items.id))
    .where(eq(items.creatorId, creatorId))
    .groupBy(items.id);

  let mine = new Set<string>();
  if (viewerId && rows.length) {
    const voted = await db
      .select({ itemId: votes.itemId })
      .from(votes)
      .where(and(eq(votes.userId, viewerId), inArray(votes.itemId, rows.map((r) => r.id))));
    mine = new Set(voted.map((v) => v.itemId));
  }
  return rows.map((r) => ({ ...r, voted: mine.has(r.id) }));
}

export async function getItem(id: string): Promise<Item | undefined> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const db = await getDb();
  const [row] = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return row;
}

type ItemInput = Pick<Item, "title" | "description" | "status" | "targetMonth" | "doneUrl">;

export async function addItem(creatorId: string, input: ItemInput) {
  const db = await getDb();
  await db.insert(items).values({ ...input, creatorId });
}

export async function updateItem(id: string, input: ItemInput) {
  const db = await getDb();
  await db.update(items).set({ ...input, updatedAt: new Date() }).where(eq(items.id, id));
}

export async function deleteItem(id: string) {
  const db = await getDb();
  await db.delete(items).where(eq(items.id, id));
}

// ---- votes ----

export async function toggleVote(itemId: string, userId: string) {
  const db = await getDb();
  const removed = await db
    .delete(votes)
    .where(and(eq(votes.itemId, itemId), eq(votes.userId, userId)))
    .returning({ itemId: votes.itemId });
  if (!removed.length) await db.insert(votes).values({ itemId, userId }).onConflictDoNothing();

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(votes)
    .where(eq(votes.itemId, itemId));
  return { votes: n, voted: removed.length === 0 };
}
