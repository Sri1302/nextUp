import Link from "next/link";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import Avatar from "@/components/Avatar";
import { CategoryTags, Followers, PlatformBadge } from "@/components/Bits";
import { CATEGORIES, CATEGORY_KEYS, isCategory, type Category } from "@/lib/types";
import SiteNav from "@/components/SiteNav";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Explore creators · NextUp",
  description: "Find YouTube and Instagram creators and vote on what they make next.",
  alternates: { canonical: "/explore" },
};

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = "", cat: rawCat } = await searchParams;
  const cat = isCategory(rawCat) ? rawCat : undefined;
  const viewer = await getCurrentUser();
  const creator = viewer && (await data.getCreatorByUserId(viewer.id));
  const list = await data.listCreators(q, cat);
  const href = (c?: Category) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("cat", c);
    const s = p.toString();
    return s ? `/explore?${s}` : "/explore";
  };

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
            {cat && <input type="hidden" name="cat" value={cat} />}
            <input name="q" defaultValue={q} placeholder="Search by name or @handle" aria-label="Search creators" />
            <button className="btn primary">Search</button>
          </form>
          <nav className="filter-row" aria-label="Filter by category">
            <Link href={href()} className={`filter ${!cat ? "on" : ""}`}>
              All
            </Link>
            {CATEGORY_KEYS.map((c) => (
              <Link key={c} href={href(c)} className={`filter ${cat === c ? "on" : ""}`}>
                {CATEGORIES[c].emoji} {CATEGORIES[c].label}
              </Link>
            ))}
          </nav>
        </header>

        {list.length === 0 ? (
          <p className="empty">
            {q || cat ? (
              <>
                No creators match{q ? ` "${q}"` : ""}{cat ? ` in ${CATEGORIES[cat].label}` : ""}. <Link href="/explore">Show all</Link>
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
                    <CategoryTags categories={c.categories} />
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
