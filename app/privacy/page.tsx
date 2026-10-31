import Link from "next/link";

export const metadata = { title: "Privacy · NextUp" };

// Starter policy: review with someone qualified before launch.
export default function Privacy() {
  return (
    <main className="page prose">
      <Link href="/" className="logo">
        NextUp
      </Link>
      <h1>Privacy policy</h1>
      <p className="muted">Last updated: October 31, 2026</p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Creators</strong> signing in with Google: your name, email, profile photo and, if you allow it, your
          YouTube channel name, link, photo and subscriber count (read-only).
        </li>
        <li>
          <strong>Creators</strong> signing in with Instagram: your username, name, profile photo and follower count.
        </li>
        <li>
          <strong>Fans</strong> signing in with Google to vote: your name, email and profile photo, plus the items you
          voted on.
        </li>
        <li>The timeline items creators add.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run NextUp: to sign you in, show creator profiles and timelines, and count one vote per person. We don't
        sell your data, show ads, or post anything to your YouTube or Instagram account. We don't keep your Google or
        Instagram access tokens after sign-in.
      </p>

      <h2>Who can see what</h2>
      <p>
        Creator profiles, timelines and vote counts are public. Who voted for what is not shown to anyone, including the
        creator.
      </p>

      <h2>Deleting your data</h2>
      <p>
        Creators can delete their account from the dashboard (Edit profile → Delete account). This permanently removes
        the profile, timeline and votes. Fans, or anyone who wants their data removed, can contact us and we'll delete it.
      </p>

      <h2>Contact</h2>
      <p>Questions or deletion requests: add your contact email here before launch.</p>
    </main>
  );
}
