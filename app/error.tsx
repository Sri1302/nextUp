"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page center-page">
      <h1>Something went wrong</h1>
      <p className="muted">Please try again. If it keeps happening, come back in a few minutes.</p>
      <div className="row center">
        <button className="btn primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="btn ghost">
          Go home
        </Link>
      </div>
    </main>
  );
}
