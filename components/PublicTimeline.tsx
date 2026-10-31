"use client";

import { useState } from "react";
import type { ItemWithVotes, Platform } from "@/lib/types";
import { monthLabel } from "@/lib/format";
import { StatusPill } from "./Bits";
import VoteButton from "./VoteButton";

type View = "top" | "timeline";

export default function PublicTimeline({
  items,
  platform,
  loginHref,
}: {
  items: ItemWithVotes[];
  platform: Platform;
  loginHref: string | null;
}) {
  const [view, setView] = useState<View>("top");

  if (items.length === 0) {
    return <p className="empty">Nothing on the timeline yet. Check back soon!</p>;
  }

  return (
    <>
      <div className="segmented tabs" role="tablist">
        <button role="tab" aria-selected={view === "top"} className={view === "top" ? "on" : ""} onClick={() => setView("top")}>
          Most wanted
        </button>
        <button
          role="tab"
          aria-selected={view === "timeline"}
          className={view === "timeline" ? "on" : ""}
          onClick={() => setView("timeline")}
        >
          Timeline
        </button>
      </div>
      {view === "top" ? (
        <TopView items={items} platform={platform} loginHref={loginHref} />
      ) : (
        <TimelineView items={items} platform={platform} loginHref={loginHref} />
      )}
    </>
  );
}

type ViewProps = { items: ItemWithVotes[]; platform: Platform; loginHref: string | null };

function TopView({ items, platform, loginHref }: ViewProps) {
  const open = items.filter((i) => i.status !== "done").sort((a, b) => b.votes - a.votes);
  const done = items.filter((i) => i.status === "done");
  return (
    <>
      <p className="hint">{loginHref ? "Sign in with Google, then tap ▲ on what you want to see next." : "Tap ▲ on what you want to see next."}</p>
      <ol className="list">
        {open.map((item, idx) => (
          <li key={item.id} className="card item">
            <div className="rank">#{idx + 1}</div>
            <ItemBody item={item} platform={platform} />
            <VoteButton itemId={item.id} votes={item.votes} voted={item.voted} loginHref={loginHref} />
          </li>
        ))}
      </ol>
      {done.length > 0 && (
        <>
          <h2 className="section-title">You asked, it's out ✓</h2>
          <ul className="list">
            {done.map((item) => (
              <li key={item.id} className="card item done">
                <ItemBody item={item} platform={platform} />
                <div className="votes-static">
                  <strong>{item.votes}</strong>
                  <span className="small muted">votes</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function TimelineView({ items, platform, loginHref }: ViewProps) {
  const sorted = [...items].sort((a, b) => {
    if (!a.targetMonth !== !b.targetMonth) return a.targetMonth ? -1 : 1;
    return a.targetMonth.localeCompare(b.targetMonth) || b.votes - a.votes;
  });
  const groups: { label: string; items: ItemWithVotes[] }[] = [];
  for (const item of sorted) {
    const label = monthLabel(item.targetMonth);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="timeline">
      {groups.map((g) => (
        <section key={g.label} className="tl-group">
          <h3 className="tl-month">
            <span className="dot" />
            {g.label}
          </h3>
          <ul className="list">
            {g.items.map((item) => (
              <li key={item.id} className={`card item ${item.status === "done" ? "done" : ""}`}>
                <ItemBody item={item} platform={platform} />
                {item.status === "done" ? (
                  <div className="votes-static">
                    <strong>{item.votes}</strong>
                    <span className="small muted">votes</span>
                  </div>
                ) : (
                  <VoteButton itemId={item.id} votes={item.votes} voted={item.voted} loginHref={loginHref} />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ItemBody({ item, platform }: { item: ItemWithVotes; platform: Platform }) {
  return (
    <div className="grow">
      <StatusPill status={item.status} />
      <h3>{item.title}</h3>
      {item.description && <p className="muted">{item.description}</p>}
      {item.status === "done" && item.doneUrl && (
        <a className="watch" href={item.doneUrl} target="_blank" rel="noopener noreferrer">
          {platform === "youtube" ? "▶ Watch it" : "View the post"} →
        </a>
      )}
    </div>
  );
}
