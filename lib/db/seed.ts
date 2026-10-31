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

  const [owner] = await db.insert(users).values({ name: "Striker Sessions" }).returning({ id: users.id });
  const [creator] = await db
    .insert(creators)
    .values({
      userId: owner.id,
      handle: "demo",
      name: "Striker Sessions",
      platform: "youtube",
      channelUrl: "https://www.youtube.com/",
      bio: "Football skills, training and match breakdowns. You pick what I film next ⚽",
      followerCount: 284000,
      categories: ["sports", "fitness"],
    })
    .returning({ id: creators.id });

  const fans = await db
    .insert(users)
    .values(Array.from({ length: 90 }, (_, i) => ({ name: `Demo fan ${i + 1}` })))
    .returning({ id: users.id });

  const raw: [string, string, Status, number, number][] = [
    ["Learning the knuckleball free kick in 30 days", "Daily practice until I can bend (or not bend) one into the top corner.", "in_progress", 0, 74],
    ["Pro footballer's full day of eating", "Copying an elite player's diet for a week: breakfast to recovery shake.", "planned", 1, 63],
    ["Ranking the 10 best goals of the season", "Breaking down technique, build-up and difficulty for each one.", "planned", 1, 51],
    ["Sunday league to semi-pro: can I make the trial?", "A 3-month training series ending in a real trial match.", "idea", 0, 82],
    ["5 drills to get faster on the ball", "No equipment needed, perfect for the park.", "idea", 0, 37],
    ["Testing 2027's top football boots", "Speed, touch and comfort, tested on the pitch.", "idea", 0, 28],
    ["Street football in 5 cities", "Panna and small-sided games across Lisbon, London, Rio, Mumbai and Lagos.", "idea", 0, 19],
    ["Penalty challenge vs a pro goalkeeper", "", "done", -1, 66],
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
