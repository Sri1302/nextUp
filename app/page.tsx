import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { countCreators, getCreatorByUserId } from "@/lib/data";
import SignInButtons from "@/components/SignInButtons";
import { isConfigured } from "@/lib/auth/oauth";
import SiteNav from "@/components/SiteNav";
import { PlatformBadge } from "@/components/Bits";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

const MESSAGES: Record<string, string> = {
  denied: "Sign-in was cancelled.",
  expired: "Your sign-in took too long or was interrupted. Please try again.",
  signin_failed: "We couldn't sign you in. Please try again.",
  not_configured: "This sign-in option isn't set up yet.",
};

const PREVIEW = [
  { title: "Solo trip to Iceland in winter", status: "Planned", cls: "planned", votes: 57, on: true },
  { title: "Japan on $50 a day", status: "In progress", cls: "in_progress", votes: 48, on: false },
  { title: "My full travel camera kit", status: "Idea", cls: "idea", votes: 22, on: false },
];

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const user = await getCurrentUser();
  const creator = user && (await getCreatorByUserId(user.id));
  const error = q.error && (MESSAGES[q.error] ?? MESSAGES.signin_failed);
  const liveCount = await countCreators();

  return (
    <>
      <SiteNav>
        {liveCount > 0 && (
          <Link href="/explore" className="live-pill" title="Creators with a NextUp timeline">
            <span className="live-dot" aria-hidden />
            <strong>{liveCount.toLocaleString("en")}</strong>
            <span className="hide-sm">{liveCount === 1 ? "creator" : "creators"}</span> live
          </Link>
        )}
        <Link href="/explore" className="btn ghost small">
          Explore
        </Link>
        {creator && (
          <Link href="/dashboard" className="btn primary small">
            Dashboard
          </Link>
        )}
      </SiteNav>

      <main className="page landing">
        <section className="hero">
          <span className="eyebrow">
            <b /> For YouTube &amp; Instagram creators
          </span>
          <h1>
            Let your fans pick <span className="grad">what you make next.</span>
          </h1>
          <p className="lead">
            Share a simple timeline of your upcoming ideas. Fans upvote. You create what they actually want to watch.
          </p>
        </section>

        {error && <p className="banner error-banner">{error}</p>}
        {q.deleted && <p className="banner">Your account has been deleted.</p>}

        <section className="card signin">
          {creator ? (
            <div className="stack">
              <h2>Welcome back, {creator.name}</h2>
              <Link href="/dashboard" className="btn accent big block">
                Open your dashboard →
              </Link>
            </div>
          ) : user ? (
            <div className="stack">
              <h2>Welcome back, {user.name.split(" ")[0] || "there"}</h2>
              <Link href="/explore" className="btn accent big block">
                Explore creators and vote →
              </Link>
              <a href="/auth/google?intent=creator" className="btn big block">
                🎬 I'm a creator too
              </a>
            </div>
          ) : (
            <SignInButtons instagram={isConfigured("instagram") || process.env.NODE_ENV === "development"} />
          )}
        </section>

        <section className="preview" aria-label="Example creator timeline">
          <div className="preview-window">
            <div className="preview-bar">
              <i />
              <i />
              <i />
              <span>nextup.app/@demo</span>
            </div>
            <div className="preview-body">
              <div className="preview-head">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 17, background: "var(--grad)" }}>
                  M
                </div>
                <div className="grow">
                  <h3>Maya Travels</h3>
                  <span className="muted small">What should I make next?</span>
                </div>
                <PlatformBadge platform="youtube" />
              </div>
              {PREVIEW.map((p, i) => (
                <div key={p.title} className="preview-row">
                  <span className="rank">#{i + 1}</span>
                  <div className="grow">
                    <span className={`pill ${p.cls}`}>{p.status}</span>
                    <h3>{p.title}</h3>
                  </div>
                  <span className={`vote ${p.on ? "on" : ""}`}>
                    <span className="arrow">▲</span>
                    <span className="count">{p.votes}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="preview-cta">
            <Link href="/@demo" className="btn small">
              See the live demo →
            </Link>
          </div>
        </section>

        <ol className="steps">
          <li>
            <span className="step-num">1</span>
            <strong>Plan</strong>
            <span>Add the videos, reels and series you're thinking about.</span>
          </li>
          <li>
            <span className="step-num">2</span>
            <strong>Share</strong>
            <span>Drop your timeline link in your bio or video description.</span>
          </li>
          <li>
            <span className="step-num">3</span>
            <strong>Create</strong>
            <span>Make the top pick, then link it so fans see it's out.</span>
          </li>
        </ol>

        <footer className="site-footer">
          <span>© NextUp</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </main>
    </>
  );
}
