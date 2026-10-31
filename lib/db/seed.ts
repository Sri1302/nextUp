import { eq } from "drizzle-orm";
import type { DB } from "./index";
import { creators, items, users, votes } from "./schema";
import type { Status } from "../types";

function monthFromNow(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Creates the @demo creator shown on the landing page. Safe to run repeatedly.
export async function seedDemo(db: DB) {
  const existing = await db.select({ id: creators.id }).from(creators).where(eq(creators.handle, "demo")).limit(1);
  if (existing.length) return false;

  const [owner] = await db.insert(users).values({ name: "Maya Travels" }).returning({ id: users.id });
  const [creator] = await db
    .insert(creators)
    .values({
      userId: owner.id,
      handle: "demo",
      name: "Maya Travels",
      platform: "youtube",
      channelUrl: "https://www.youtube.com/",
      bio: "Budget travel, street food and slow adventures. Help me pick where I go next!",
      followerCount: 128400,
    })
    .returning({ id: creators.id });

  const fans = await db
    .insert(users)
    .values(Array.from({ length: 60 }, (_, i) => ({ name: `Demo fan ${i + 1}` })))
    .returning({ id: users.id });

  const raw: [string, string, Status, number, number][] = [
    ["Japan on $50 a day", "Two weeks across Tokyo, Kyoto and Osaka without breaking the bank.", "in_progress", 0, 48],
    ["Street food tour of Bangkok", "Night markets, hidden stalls and the best pad kra pao in town.", "planned", 1, 31],
    ["My full travel camera kit", "Everything I film with, what's worth it and what I'd skip.", "idea", 0, 22],
    ["Solo trip to Iceland in winter", "Northern lights, ice caves and a lot of layers.", "planned", 3, 57],
    ["Q&A: how I fund my travels", "Your questions about money, sponsors and working on the road.", "idea", 0, 15],
    ["Hiking the Inca Trail", "Four days to Machu Picchu.", "idea", 0, 9],
    ["Lisbon in 48 hours", "", "done", -1, 40],
  ];

  for (const [title, description, status, offset, n] of raw) {
    const [item] = await db
      .insert(items)
      .values({
        creatorId: creator.id,
        title,
        description,
        status,
        targetMonth: status === "idea" ? "" : monthFromNow(offset),
        doneUrl: status === "done" ? "https://www.youtube.com/" : "",
      })
      .returning({ id: items.id });
    await db.insert(votes).values(fans.slice(0, n).map((f) => ({ itemId: item.id, userId: f.id })));
  }
  return true;
}
