import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { countCreators, getCreatorByUserId, listCreators } from "@/lib/data";
import { isConfigured } from "@/lib/auth/oauth";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/types";
import ClaimForm from "@/components/ClaimForm";
import CreatorCard from "@/components/CreatorCard";
import LpNav from "@/components/LpNav";
import PageBuilder from "@/components/PageBuilder";
import HeroSlideshow from "@/components/HeroSlideshow";
import { InstagramIcon, MonoIcon, YouTubeIcon } from "@/components/BrandIcons";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

// The "Creators who listen live here" row appears once this many creators have pages.
const SHOW_CREATORS_FROM = 4;

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
  const [liveCount, creators] = await Promise.all([countCreators(), listCreators("", undefined, 12)]);
  const instagram = isConfigured("instagram") || process.env.NODE_ENV === "development";

  return (
    <div className="lp">
      <LpNav>
        <Link href="/explore" className="lp-link hide-sm">
          Explore
        </Link>
        <a href="#how" className="lp-link hide-sm">
          How it works
        </a>
        <span className="hb-divider hide-sm" aria-hidden />
        {creator ? (
          <Link href="/dashboard" className="lp-pill">
            Dashboard
          </Link>
        ) : (
          <>
            <a href="/auth/google?intent=creator" className="lp-link">
              Log in
            </a>
            <a href="#claim" className="lp-pill hide-sm">
              Claim your page
            </a>
          </>
        )}
      </LpNav>

      <section className="hb-hero" id="claim">
        <HeroSlideshow />
        <div className="hb-hero-shade" />
        <div className="hb-hero-inner">
          <h1>
            Your fans pick
            <em>what you make next.</em>
          </h1>
          <p className="hb-lead">One link for your bio. Fans upvote the videos you&apos;re planning, and you make what they actually want.</p>

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
              <ClaimForm />
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
              </p>
            </>
          )}
        </div>
      </section>

      {creators.length >= SHOW_CREATORS_FROM && (
      <section className="hb-section">
        <div className="hb-section-head">
          <h2>
            Creators who listen
            <em> live here.</em>
          </h2>
          <p className="hb-sub">
            {liveCount > 0 ? (
              <>
                <span className="live-dot" aria-hidden /> {liveCount} {liveCount === 1 ? "creator has" : "creators have"} a NextUp page
              </>
            ) : (
              "NextUp just launched. Be one of the first creators here."
            )}
          </p>
        </div>
        <nav className="lp-filters" aria-label="Browse by category">
          <Link href="/explore" className="on">
            All
          </Link>
          {CATEGORY_KEYS.slice(0, 8).map((c) => (
            <Link key={c} href={`/explore?cat=${c}`}>
              {CATEGORIES[c].label}
            </Link>
          ))}
        </nav>
        <div className="hb-row">
          {creators.map((c) => (
            <CreatorCard key={c.id} c={c} />
          ))}
          {creators.length < 4 &&
            Array.from({ length: 4 - creators.length }, (_, i) => (
              <a key={i} href="#claim" className="pc pc-open">
                <span className="pc-open-plus" aria-hidden>
                  +
                </span>
                <strong>Your page here</strong>
                <span>nextup/@yourname</span>
              </a>
            ))}
        </div>
      </section>
      )}

      <section className="hb-section" id="how">
        <h2 className="hb-center">
          All of it, <em>in one link.</em>
        </h2>
        <div className="hb-features">
          <article className="hb-feature">
            <div className="hb-art hb-art-plan" aria-hidden>
              <div>
                <i className="dot idea" />
                Idea
              </div>
              <div>
                <i className="dot planned" />
                Planned
              </div>
              <div>
                <i className="dot filming" />
                Filming
              </div>
              <div className="on">
                <i className="dot out" />
                Out now
              </div>
            </div>
            <h3>Plan</h3>
            <p>Add the videos, reels and series you&apos;re thinking about, and move them from idea to out now.</p>
          </article>
          <article className="hb-feature">
            <div className="hb-art hb-art-share" aria-hidden>
              <div className="hb-link">
                nextup/@yourname <b>Copy</b>
              </div>
              <div className="hb-bios">
                <span>
                  <MonoIcon name="youtube" size={16} /> Description
                </span>
                <span>
                  <MonoIcon name="instagram" size={16} /> Bio
                </span>
              </div>
            </div>
            <h3>Share</h3>
            <p>One link in your bio or video description. Fans open it and vote with a single tap.</p>
          </article>
          <article className="hb-feature">
            <div className="hb-art hb-art-vote" aria-hidden>
              <span className="hb-vote">
                ▲<b>Vote</b>
              </span>
              <span className="hb-badge">🔥 Most wanted</span>
            </div>
            <h3>Create</h3>
            <p>See what your audience wants most, make it, and mark it out now so fans see their vote paid off.</p>
          </article>
        </div>
      </section>

      {!creator && (
        <section className="hb-section hb-split">
          <div className="hb-split-text">
            <h2>
              See your page
              <em> before you sign up.</em>
            </h2>
            <p>Type your handle and a few video ideas into the phone, pick a colour, and tap ▲ to see what your fans will do. Claim it and it&apos;s live.</p>
            <ol>
              <li>Type your handle</li>
              <li>Add ideas you&apos;re planning</li>
              <li>Pick a colour, then claim it</li>
            </ol>
          </div>
          <div className="hb-split-phone">
            <PageBuilder compact />
          </div>
        </section>
      )}

      {!creator && (
        <section className="hb-final">
          <h2>
            Be one of the first
            <em> creators on NextUp.</em>
          </h2>
          <p>Free. Takes a minute. We never post for you.</p>
          <ClaimForm id="claim-bottom" />
        </section>
      )}

      <footer className="hb-foot">
        <div className="hb-foot-brand">
          <Link href="/" className="lp-logo">
            <span className="hb-mark" aria-hidden>
              ▲
            </span>
            NextUp
          </Link>
          <p>Let your fans pick what you make next.</p>
        </div>
        <div className="hb-foot-cols">
          <div>
            <h4>Product</h4>
            <Link href="/explore">Explore creators</Link>
            <a href="#claim">Claim your page</a>
            <a href="/auth/google?intent=creator">Log in</a>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:chennusri22@gmail.com">Email us</a>
          </div>
        </div>
        <p className="hb-copy">© {new Date().getFullYear()} NextUp. All rights reserved.</p>
      </footer>
    </div>
  );
}
