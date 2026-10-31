import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addItem, signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import { appUrl } from "@/lib/env";
import Avatar from "@/components/Avatar";
import { Followers, PlatformBadge } from "@/components/Bits";
import ItemEditor from "@/components/ItemEditor";
import ItemFields from "@/components/ItemFields";
import ProfileForm from "@/components/ProfileForm";
import ShareBar from "@/components/ShareBar";
import SubmitButton from "@/components/SubmitButton";
import SiteNav from "@/components/SiteNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard · NextUp", robots: { index: false } };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  const me = user && (await data.getCreatorByUserId(user.id));
  if (!me) redirect("/");

  const { welcome } = await searchParams;
  const items = (await data.getItems(me.id)).sort((a, b) => b.votes - a.votes);
  const open = items.filter((i) => i.status !== "done");
  const done = items.filter((i) => i.status === "done");
  const totalVotes = items.reduce((n, i) => n + i.votes, 0);

  const h = await headers();
  const origin = appUrl() || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const shareUrl = `${origin}/@${me.handle}`;

  return (
    <>
      <SiteNav>
        <Link href={`/@${me.handle}`} className="btn ghost small">
          View page
        </Link>
        <form action={signOut}>
          <button className="btn small">Sign out</button>
        </form>
      </SiteNav>
    <main className="page">

      {welcome && (
        <p className="banner">
          Welcome to NextUp! Your link is <strong>/@{me.handle}</strong>. You can change it under Edit profile below.
        </p>
      )}

      <section className="card creator-head">
        <div className="creator-head-top">
          <div className="avatar-ring">
            <Avatar name={me.name} handle={me.handle} url={me.avatarUrl} size={64} />
          </div>
          <div className="grow">
            <p className="eyebrow-text">Creator dashboard</p>
            <h1>{me.name}</h1>
            <div className="row wrap gap-sm">
              <span className="muted">@{me.handle}</span>
              <PlatformBadge platform={me.platform} />
              <Followers count={me.followerCount} platform={me.platform} />
            </div>
          </div>
        </div>
        <ShareBar url={shareUrl} path={`/@${me.handle}`} />
      </section>

      <div className="stats">
        <div className="stat">
          <span className="stat-icon">🗂️</span>
          <strong>{open.length}</strong>
          <span>on the timeline</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🔥</span>
          <strong>{totalVotes}</strong>
          <span>fan votes</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🚀</span>
          <strong>{done.length}</strong>
          <span>delivered</span>
        </div>
      </div>

      <section className="card add-card">
        <div className="add-head">
          <span className="add-icon" aria-hidden>
            ✨
          </span>
          <div>
            <h2>Add a new idea</h2>
            <p className="muted small">Fans see it on your page and can start voting right away.</p>
          </div>
        </div>
        <form action={addItem} className="stack">
          <ItemFields />
          <SubmitButton pendingText="Adding…" className="btn accent big block">
            Add to timeline →
          </SubmitButton>
        </form>
      </section>

      <section>
        <h2 className="section-title">
          What fans want most <span className="count-chip">{open.length}</span>
        </h2>
        {open.length === 0 ? (
          <p className="empty">Nothing planned yet. Add your first idea above.</p>
        ) : (
          <ol className="list">
            {open.map((item, idx) => (
              <ItemEditor key={item.id} item={item} rank={idx + 1} />
            ))}
          </ol>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="section-title">Delivered</h2>
          <ul className="list">
            {done.map((item, idx) => (
              <ItemEditor key={item.id} item={item} rank={idx + 1} />
            ))}
          </ul>
        </section>
      )}

      <details className="card" open={!!welcome}>
        <summary>Edit profile</summary>
        <ProfileForm creator={me} />
      </details>
    </main>
    </>
  );
}
