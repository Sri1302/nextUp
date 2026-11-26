import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { countCreators, getCreatorByUserId, listCreators } from "@/lib/data";
import { isConfigured } from "@/lib/auth/oauth";
import ClaimForm from "@/components/ClaimForm";
import PageBuilder from "@/components/PageBuilder";
import CreatorCard from "@/components/CreatorCard";
import { InstagramIcon, YouTubeIcon } from "@/components/BrandIcons";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

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
  const [liveCount, creators] = await Promise.all([countCreators(), listCreators("", undefined, 8)]);
  const instagram = isConfigured("instagram") || process.env.NODE_ENV === "development";

  return (
    <div className="lp">
      <header className="lp-nav">
        <Link href="/" className="lp-logo">
          <span className="logo-mark" aria-hidden>
            ▲
          </span>
          NextUp
        </Link>
        <nav>
          {liveCount > 0 && (
            <Link href="/explore" className="lp-live" title="Creators who already have a NextUp page">
              <span className="live-dot" aria-hidden />
              {liveCount} {liveCount === 1 ? "creator" : "creators"} on NextUp
            </Link>
          )}
          <Link href="/explore" className="lp-link">
            Explore
          </Link>
          {creator ? (
            <Link href="/dashboard" className="lp-pill">
              Dashboard
            </Link>
          ) : (
            <a href="/auth/google?intent=creator" className="lp-pill">
              Log in
            </a>
          )}
        </nav>
      </header>

      <section className="lp-hero">
        <div className="lp-glow" aria-hidden />
        <p className="lp-eyebrow">For YouTube &amp; Instagram creators</p>
        <h1>
          Your fans pick
          <em>what you make next</em>
        </h1>
        <p className="lp-lead">One link for your bio. Fans upvote the videos you&apos;re planning, and you make what they actually want.</p>

        {error && <p className="lp-error">{error}</p>}
        {q.deleted && <p className="lp-note">Your account has been deleted.</p>}

        {creator ? (
          <div className="lp-signed">
            <Link href="/dashboard" className="claim-btn solo">
              Open your dashboard <span aria-hidden>→</span>
            </Link>
            <Link href={`/@${creator.handle}`} className="lp-link">
              View your page ↗
            </Link>
          </div>
        ) : (
          <>
            <PageBuilder />
            <p className="lp-or">
              or continue with{" "}
              <a href="/auth/google?intent=creator">
                <YouTubeIcon size={12} /> YouTube
              </a>
              {instagram && (
                <>
                  {" "}
                  ·{" "}
                  <a href="/auth/instagram?intent=creator">
                    <InstagramIcon size={14} /> Instagram
                  </a>
                </>
              )}
              {user && (
                <>
                  {" "}
                  · Here to vote? <Link href="/explore">Explore creators →</Link>
                </>
              )}
            </p>
          </>
        )}
      </section>

      {creators.length > 0 && (
        <section className="lp-section">
          <div className="lp-section-head">
            <h2>
              Creators on <em>NextUp</em>
            </h2>
            <Link href="/explore">See all →</Link>
          </div>
          <div className="lp-row">
            {creators.map((c) => (
              <CreatorCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}

      <section className="lp-section">
        <h2 className="lp-center">
          Three steps. <em>Zero guessing.</em>
        </h2>
        <ol className="lp-steps">
          <li>
            <span>01</span>
            <strong>Plan</strong>
            <p>Add the videos, reels and series you&apos;re thinking about, from rough idea to filming.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Share</strong>
            <p>Put your NextUp link in your bio or video description. Fans vote with one tap.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Create</strong>
            <p>Make the top pick, then mark it out now so fans see their vote paid off.</p>
          </li>
        </ol>
      </section>

      {!creator && (
        <section className="lp-final">
          <h2>
            Your audience already has opinions.
            <em>Let them vote.</em>
          </h2>
          <ClaimForm id="claim-bottom" />
        </section>
      )}

      <footer className="lp-foot">
        <span>© NextUp</span>
        <Link href="/explore">Explore</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
