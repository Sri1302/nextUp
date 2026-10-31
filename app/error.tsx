"use client";

import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <SiteNav />
      <main className="page center-page">
        <span className="big-emoji" aria-hidden>
          😵
        </span>
        <h1>Something went wrong</h1>
        <p className="muted">Please try again. If it keeps happening, come back in a few minutes.</p>
        <div className="row center">
          <button className="btn primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn">
            Go home
          </Link>
        </div>
      </main>
    </>
  );
}
