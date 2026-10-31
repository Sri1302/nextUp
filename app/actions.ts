"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as data from "@/lib/data";
import { safeReturnTo } from "@/lib/auth/flow";
import { destroySession, getCurrentUser } from "@/lib/auth/session";
import { PLATFORMS, STATUSES, type Platform, type Status } from "@/lib/types";

function str(fd: FormData, key: string, max = 500) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

// Only allow http(s) links so nothing like javascript: ends up in an href.
function cleanUrl(raw: string) {
  if (!raw) return "";
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

function platformOf(fd: FormData): Platform {
  const p = fd.get("platform") as Platform;
  return PLATFORMS.includes(p) ? p : "youtube";
}

function statusOf(fd: FormData): Status {
  const s = fd.get("status") as Status;
  return STATUSES.includes(s) ? s : "idea";
}

function monthOf(fd: FormData) {
  const m = str(fd, "targetMonth", 7);
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : "";
}

function itemInput(fd: FormData) {
  return {
    title: str(fd, "title", 120),
    description: str(fd, "description", 500),
    status: statusOf(fd),
    targetMonth: monthOf(fd),
    doneUrl: cleanUrl(str(fd, "doneUrl", 300)),
  };
}

async function requireCreator() {
  const user = await getCurrentUser();
  const creator = user && (await data.getCreatorByUserId(user.id));
  if (!creator) redirect("/");
  return creator;
}

async function requireOwnItem(fd: FormData) {
  const creator = await requireCreator();
  const item = await data.getItem(str(fd, "id", 64));
  if (!item || item.creatorId !== creator.id) throw new Error("Not found");
  return item;
}

function refresh() {
  revalidatePath("/", "layout");
}

// ---- account ----

export async function signOut(fd: FormData) {
  await destroySession();
  redirect(safeReturnTo(str(fd, "returnTo", 200)));
}

export async function deleteAccount() {
  const user = await getCurrentUser();
  if (user) {
    await destroySession();
    await data.deleteUser(user.id);
  }
  redirect("/?deleted=1");
}

export async function updateProfile(_prev: string | null, fd: FormData): Promise<string | null> {
  const creator = await requireCreator();
  const err = await data.updateCreator(creator.id, {
    handle: data.normalizeHandle(str(fd, "handle", 40)),
    name: str(fd, "name", 60) || creator.name,
    platform: platformOf(fd),
    channelUrl: cleanUrl(str(fd, "channelUrl", 300)),
    bio: str(fd, "bio", 280),
  });
  if (!err) refresh();
  return err ?? "saved";
}

// ---- timeline items ----

export async function addItem(fd: FormData) {
  const creator = await requireCreator();
  const input = itemInput(fd);
  if (!input.title) return;
  await data.addItem(creator.id, { ...input, doneUrl: "" });
  refresh();
}

export async function updateItem(fd: FormData) {
  const item = await requireOwnItem(fd);
  const input = itemInput(fd);
  await data.updateItem(item.id, { ...input, title: input.title || item.title });
  refresh();
}

export async function deleteItem(fd: FormData) {
  const item = await requireOwnItem(fd);
  await data.deleteItem(item.id);
  refresh();
}

// ---- voting: one vote per signed-in Google account per item ----

export type VoteResult = { votes: number; voted: boolean } | { error: "auth" | "own" | "closed" };

export async function toggleVote(itemId: string): Promise<VoteResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };

  const item = await data.getItem(itemId);
  if (!item || item.status === "done") return { error: "closed" };

  const own = await data.getCreatorByUserId(user.id);
  if (own?.id === item.creatorId) return { error: "own" };

  const result = await data.toggleVote(itemId, user.id);
  refresh();
  return result;
}
