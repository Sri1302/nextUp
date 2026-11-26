"use client";

import { useState } from "react";
import type { ItemWithVotes, Platform } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { monthLabel, youtubeId } from "@/lib/format";
import { MonoIcon } from "./BrandIcons";
import VoteButton from "./VoteButton";

type View = "top" | "timeline";
type ViewProps = { items: ItemWithVotes[]; platform: Platform; loginHref: string | null };

export default function PublicTimeline({ items, platform, loginHref }: ViewProps) {
  const [view, setView] = useState<View>("top");
  const open = items.filter((i) => i.status !== "done");
  const done = items.filter((i) => i.status === "done");

  if (items.length === 0) {
    return (
      <section className="cp-section">
        <div className="cp-empty">Nothing on the timeline yet. Check back soon!</div>
      </section>
    );
  }

  return (
    <>
      {open.length > 0 && (
        <section className="cp-section">
          <div className="cp-head">
            <h2>Vote on what&apos;s next</h2>
            <div className="cp-tabs" role="tablist">
              {(["top", "timeline"] as const).map((v) => (
                <button key={v} role="tab" aria-selected={view === v} className={view === v ? "on" : ""} onClick={() => setView(v)}>
                  {v === "top" ? "Top" : "Timeline"}
                </button>
              ))}
            </div>
          </div>
          {view === "top" ? <TopView items={open} platform={platform} loginHref={loginHref} /> : <TimelineView items={open} platform={platform} loginHref={loginHref} />}
        </section>
      )}

      {done.length > 0 && (
        <section className="cp-section">
          <div className="cp-head">
            <h2>You asked, it&apos;s out</h2>
          </div>
          <div className="cp-list">
            {done.map((item) => (
              <OutNow key={item.id} item={item} platform={platform} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function TopView({ items, loginHref }: ViewProps) {
  const ranked = [...items].sort((a, b) => b.votes - a.votes);
  const [first, ...rest] = ranked;
  const featured = first.votes > 0;
  return (
    <div className="cp-list">
      {featured && (
        <article className="cp-feature">
          <div className="cp-feature-label">🔥 Most wanted right now</div>
          <Meta item={first} />
          <h3>{first.title}</h3>
          {first.description && <p>{first.description}</p>}
          <VoteButton itemId={first.id} votes={first.votes} voted={first.voted} loginHref={loginHref} wide />
        </article>
      )}
      {(featured ? rest : ranked).map((item, i) => (
        <IdeaCard key={item.id} item={item} rank={i + (featured ? 2 : 1)} loginHref={loginHref} />
      ))}
    </div>
  );
}

function TimelineView({ items, loginHref }: ViewProps) {
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
    <div className="cp-list">
      {groups.map((g) => (
        <div key={g.label} className="cp-month">
          <h4>{g.label}</h4>
          <div className="cp-list">
            {g.items.map((item) => (
              <IdeaCard key={item.id} item={item} loginHref={loginHref} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Meta({ item }: { item: ItemWithVotes }) {
  return (
    <span className={`cp-meta ${item.status}`}>
      <i aria-hidden />
      {STATUS_LABEL[item.status]}
      {item.targetMonth && item.status !== "done" ? ` · ${monthLabel(item.targetMonth)}` : ""}
    </span>
  );
}

function IdeaCard({ item, rank, loginHref }: { item: ItemWithVotes; rank?: number; loginHref: string | null }) {
  return (
    <article className="cp-item">
      {rank != null && <span className="cp-rank">{rank}</span>}
      <div className="grow">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
      </div>
      <VoteButton itemId={item.id} votes={item.votes} voted={item.voted} loginHref={loginHref} />
    </article>
  );
}

function OutNow({ item, platform }: { item: ItemWithVotes; platform: Platform }) {
  const vid = item.doneUrl ? youtubeId(item.doneUrl) : undefined;
  const body = (
    <>
      <div className="cp-thumb">
        {vid ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`} alt="" loading="lazy" />
        ) : (
          <MonoIcon name={platform} size={26} />
        )}
      </div>
      <div className="grow">
        <h3>{item.title}</h3>
        <span className="cp-watch">
          {item.doneUrl ? (platform === "youtube" ? "▶ Watch now" : "View the post") : "Out now"} · ▲ {item.votes} asked for it
        </span>
      </div>
    </>
  );
  return item.doneUrl ? (
    <a className="cp-out" href={item.doneUrl} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className="cp-out">{body}</div>
  );
}
