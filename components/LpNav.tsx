import Link from "next/link";

// Floating glass navigation bar used on the homepage and Explore.
export default function LpNav({ children }: { children: React.ReactNode }) {
  return (
    <header className="hb-nav">
      <div className="hb-nav-inner">
        <Link href="/" className="lp-logo" aria-label="AskFans home">
          <span className="hb-mark" aria-hidden>
            ▲
          </span>
          AskFans
        </Link>
        <nav>{children}</nav>
      </div>
    </header>
  );
}
