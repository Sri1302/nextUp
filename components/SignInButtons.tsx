import { InstagramIcon, YouTubeIcon } from "./BrandIcons";

const isDev = process.env.NODE_ENV === "development";

// Homepage sign-in, aimed at creators. Fans arrive through creators' links and sign in when they vote.
export default function SignInButtons({ instagram }: { instagram: boolean }) {
  return (
    <div className="stack">
      <h2>Create your free timeline</h2>
      <a href="/auth/google?intent=creator" className="btn oauth">
        <span className="oauth-logo">
          <YouTubeIcon size={20} />
        </span>
        Continue with YouTube
        <span className="oauth-arrow" aria-hidden>
          →
        </span>
      </a>
      {instagram && (
        <a href="/auth/instagram?intent=creator" className="btn oauth">
          <span className="oauth-logo">
            <InstagramIcon size={26} />
          </span>
          Continue with Instagram
          <span className="oauth-arrow" aria-hidden>
            →
          </span>
        </a>
      )}
      <p className="muted small center-text">
        Free. Takes a minute. We only read your public channel info and never post for you.
      </p>
      {isDev && (
        <p className="dev-note">
          Dev mode: <a href="/auth/dev?intent=creator">sign in as a test creator</a>
        </p>
      )}
      <p className="fan-note">
        Here to vote? <a href="/explore">Explore creators →</a>
      </p>
    </div>
  );
}
