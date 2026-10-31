import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCreatorByUserId } from "@/lib/data";
import SignInButtons from "@/components/SignInButtons";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  denied: "Sign-in was cancelled.",
  expired: "Your sign-in took too long or was interrupted. Please try again.",
  signin_failed: "We couldn't sign you in. Please try again.",
  not_configured: "This sign-in option isn't set up yet.",
};

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const user = await getCurrentUser();
  const creator = user && (await getCreatorByUserId(user.id));
  const error = q.error && (MESSAGES[q.error] ?? MESSAGES.signin_failed);

  return (
    <main className="page landing">
      <nav className="topbar">
        <span className="logo">NextUp</span>
        <div className="row gap-sm">
          <Link href="/explore" className="btn small ghost">
            Explore
          </Link>
          {creator && (
            <Link href="/dashboard" className="btn small">
              Dashboard
            </Link>
          )}
        </div>
      </nav>

      <section className="hero">
        <h1>
          Let your fans vote on <span className="grad">what you make next.</span>
        </h1>
        <p className="lead">
          Share your future content timeline with your YouTube and Instagram audience. They upvote, and you make what
          they actually want to watch.
        </p>
        <Link href="/@demo" className="btn ghost">
          See a demo timeline →
        </Link>
      </section>

      {error && <p className="banner error-banner">{error}</p>}
      {q.deleted && <p className="banner">Your account has been deleted.</p>}

      <section className="card signin">
        {creator ? (
          <div className="stack">
            <h2>Welcome back, {creator.name}</h2>
            <Link href="/dashboard" className="btn primary">
              Go to your dashboard
            </Link>
          </div>
        ) : user ? (
          <div className="stack">
            <h2>Welcome back, {user.name.split(" ")[0] || "there"}</h2>
            <Link href="/explore" className="btn primary">
              Explore creators and vote
            </Link>
            <a href="/auth/google?intent=creator" className="btn ghost">
              🎬 I'm a creator too: start my timeline
            </a>
          </div>
        ) : (
          <SignInButtons />
        )}
      </section>

      <ol className="steps">
        <li>
          <strong>1. Plan</strong>
          <span>Add the videos, reels and series you're thinking about.</span>
        </li>
        <li>
          <strong>2. Share</strong>
          <span>Put your timeline link in your bio or video description.</span>
        </li>
        <li>
          <strong>3. Create</strong>
          <span>Fans vote, you make the top pick, then link it so they see it's out.</span>
        </li>
      </ol>

      <SiteFooter />
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </footer>
  );
}
