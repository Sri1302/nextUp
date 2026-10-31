import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="page center-page">
        <span className="big-emoji" aria-hidden>
          🔭
        </span>
        <h1>Nothing here yet</h1>
        <p className="muted">This creator doesn't have a NextUp timeline, or the link is wrong.</p>
        <div className="row center">
          <Link href="/explore" className="btn primary">
            Explore creators
          </Link>
          <Link href="/" className="btn">
            Go home
          </Link>
        </div>
      </main>
    </>
  );
}
