const isDev = process.env.NODE_ENV === "development";

export default function SignInButtons() {
  return (
    <div className="stack">
      <h2>Creators: get your timeline</h2>
      <a href="/auth/google?intent=creator" className="btn oauth google">
        <span className="oauth-icon" aria-hidden>G</span>
        Continue with Google (YouTube)
      </a>
      <a href="/auth/instagram?intent=creator" className="btn oauth instagram">
        <span className="oauth-icon" aria-hidden>◎</span>
        Continue with Instagram
      </a>
      <p className="muted small">
        Instagram sign-in works with Business or Creator accounts. We only read your public profile: name, photo and
        follower count.
      </p>
      {isDev && (
        <p className="dev-note small">
          Dev mode: <a href="/auth/dev?intent=creator">sign in as a test creator</a> without Google or Instagram keys.
        </p>
      )}
    </div>
  );
}
