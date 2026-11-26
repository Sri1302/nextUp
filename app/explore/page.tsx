import Link from "next/link";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import CreatorCard from "@/components/CreatorCard";
import { CATEGORIES, CATEGORY_KEYS, isCategory, type Category } from "@/lib/types";

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
    <div className="lp">
      <header className="lp-nav">
        <Link href="/" className="lp-logo">
          <span className="logo-mark" aria-hidden>
            ▲
          </span>
          NextUp
        </Link>
        <nav>
          {creator ? (
            <Link href="/dashboard" className="lp-pill">
              Dashboard
            </Link>
          ) : viewer ? (
            <form action={signOut}>
              <input type="hidden" name="returnTo" value="/explore" />
              <button className="lp-link">Sign out</button>
            </form>
          ) : (
            <a href="/auth/google?intent=fan&returnTo=%2Fexplore" className="lp-pill">
              Sign in to vote
            </a>
          )}
        </nav>
      </header>

      <main className="lp-explore">
        <header className="lp-explore-head">
          <h1>
            Explore <em>creators</em>
          </h1>
          <p>
            {viewer ? `Hi ${viewer.name.split(" ")[0] || "there"} 👋 ` : ""}Pick a creator and vote on what they make next.
          </p>
          <form className="lp-search" action="/explore" role="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            {cat && <input type="hidden" name="cat" value={cat} />}
            <input name="q" defaultValue={q} placeholder="Search by name or @handle" aria-label="Search creators" />
            <button>Search</button>
          </form>
          <nav className="lp-filters" aria-label="Filter by category">
            <Link href={href()} className={!cat ? "on" : ""}>
              All
            </Link>
            {CATEGORY_KEYS.map((c) => (
              <Link key={c} href={href(c)} className={cat === c ? "on" : ""}>
                {CATEGORIES[c].emoji} {CATEGORIES[c].label}
              </Link>
            ))}
          </nav>
        </header>

        {list.length === 0 ? (
          <p className="lp-empty">
            {q || cat ? (
              <>
                No creators match{q ? ` "${q}"` : ""}
                {cat ? ` in ${CATEGORIES[cat].label}` : ""}. <Link href="/explore">Show all</Link>
              </>
            ) : (
              "No creators yet. Check back soon!"
            )}
          </p>
        ) : (
          <div className="lp-grid">
            {list.map((c) => (
              <CreatorCard key={c.id} c={c} />
            ))}
          </div>
        )}

        <footer className="lp-foot">
          <Link href="/">Are you a creator? Claim your page →</Link>
        </footer>
      </main>
    </div>
  );
}
