import SiteNav from "@/components/SiteNav";

export const metadata = { title: "Terms · NextUp", alternates: { canonical: "/terms" } };

// Starter terms: review with someone qualified before launch.
export default function Terms() {
  return (
    <>
    <SiteNav />
    <main className="page prose">
      <h1>Terms of use</h1>
      <p className="muted">Last updated: October 31, 2026</p>

      <h2>Using NextUp</h2>
      <p>
        NextUp lets creators share planned content and lets fans vote on it. Votes are suggestions: creators decide what
        they make and when.
      </p>

      <h2>Your content</h2>
      <p>
        Creators are responsible for what they post on their timeline. Don't post anything illegal, hateful, misleading
        or that you don't have the right to share. We may remove content or accounts that break these rules.
      </p>

      <h2>Fair voting</h2>
      <p>One person, one account. Using fake or automated accounts to inflate votes isn't allowed.</p>

      <h2>No warranty</h2>
      <p>NextUp is provided as is. We may change or stop the service at any time.</p>
    </main>
    </>
  );
}
