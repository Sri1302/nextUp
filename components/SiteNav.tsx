import Link from "next/link";

// Sticky top bar shared by every page; page-specific actions go in children.
export default function SiteNav({ children }: { children?: React.ReactNode }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="AskFans home">
          <span className="logo-mark" aria-hidden>
            ▲
          </span>
          AskFans
        </Link>
        <nav className="nav-actions">{children}</nav>
      </div>
    </header>
  );
}
