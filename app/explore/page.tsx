import Link from "next/link";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import Avatar from "@/components/Avatar";
import { Followers, PlatformBadge } from "@/components/Bits";
import SiteNav from "@/components/SiteNav";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Explore creators · NextUp",
  description: "Find YouTube and Instagram creators and vote on what they make next.",
};

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const viewer = await getCurrentUser();
  const creator = viewer && (await data.getCreatorByUserId(viewer.id));
  const list = await data.listCreators(q);

  return (
    <>
      <SiteNav>
        {creator ? (
          <Link href="/dashboard" className="btn primary small">
            Dashboard
          </Link>
        ) : viewer ? (
          <form action={signOut}>
            <input type="hidden" name="returnTo" value="/explore" />
            <span className="viewer-chip hide-sm">{viewer.name.split(" ")[0]}</span>
            <button className="btn small">Sign out</button>
          </form>
        ) : (
          <a href="/auth/google?intent=fan&returnTo=%2Fexplore" className="btn primary small">
            Sign in to vote
          </a>
        )}
      </SiteNav>

      <main className="page">
        <header className="explore-head">
          <h1>Explore creators</h1>
          <p className="muted">
            {viewer ? `Hi ${viewer.name.split(" ")[0] || "there"} 👋 ` : ""}Pick a creator and vote on what they make next.
          </p>
          <form className="search" action="/explore" role="search">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input name="q" defaultValue={q} placeholder="Search by name or @handle" aria-label="Search creators" />
            <button className="btn primary">Search</button>
          </form>
        </header>

        {list.length === 0 ? (
          <p className="empty">
            {q ? (
              <>
                No creators match "{q}". <Link href="/explore">Show all</Link>
              </>
            ) : (
              "No creators yet. Check back soon!"
            )}
          </p>
        ) : (
          <ul className="creator-grid">
            {list.map((c) => (
              <li key={c.id}>
                <Link href={`/@${c.handle}`} className="card creator-card">
                  <Avatar name={c.name} handle={c.handle} url={c.avatarUrl} size={52} />
                  <div className="grow">
                    <h3>{c.name}</h3>
                    <div className="row wrap gap-sm">
                      <span className="muted small">@{c.handle}</span>
                      <PlatformBadge platform={c.platform} />
                    </div>
                    {c.bio && <p className="muted small clamp">{c.bio}</p>}
                    <div className="creator-meta">
                      <Followers count={c.followerCount} platform={c.platform} />
                      <span>💡 {c.itemCount} {c.itemCount === 1 ? "idea" : "ideas"}</span>
                      <span>▲ {c.voteCount} votes</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer className="site-footer">
          <Link href="/">Are you a creator? Start your timeline →</Link>
        </footer>
      </main>
    </>
  );
}
