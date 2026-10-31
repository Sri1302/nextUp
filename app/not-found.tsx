import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page center-page">
      <h1>Page not found</h1>
      <p className="muted">This creator doesn't have a NextUp timeline yet.</p>
      <Link href="/" className="btn primary">
        Go home
      </Link>
    </main>
  );
}
