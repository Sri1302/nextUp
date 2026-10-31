"use client";

import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";

type Role = "creator" | "fan";

// "I'm a creator" / "I'm a fan" picker, then the sign-in options for that role.
export default function SignInButtons() {
  const [role, setRole] = useState<Role | null>(null);

  if (!role) {
    return (
      <div className="stack">
        <h2>Welcome to NextUp</h2>
        <div className="roles">
          <button className="role-card" onClick={() => setRole("creator")}>
            <span className="role-emoji" aria-hidden>🎬</span>
            <strong>I'm a creator</strong>
            <span>Share my content timeline and see what fans want</span>
          </button>
          <button className="role-card" onClick={() => setRole("fan")}>
            <span className="role-emoji" aria-hidden>🙋</span>
            <strong>I'm a fan</strong>
            <span>Vote on what my favourite creators make next</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <button className="linklike back" onClick={() => setRole(null)}>
        ← Back
      </button>

      {role === "creator" ? (
        <>
          <h2>🎬 Sign in as a creator</h2>
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
              Dev mode: <a href="/auth/dev?intent=creator">sign in as a test creator</a> without Google or Instagram
              keys.
            </p>
          )}
        </>
      ) : (
        <>
          <h2>🙋 Sign in as a fan</h2>
          <a href="/auth/google?intent=fan&returnTo=%2Fexplore" className="btn oauth google">
            <span className="oauth-icon" aria-hidden>G</span>
            Continue with Google
          </a>
          <p className="muted small">
            One Google account = one vote per idea, so results stay fair. We never post anything for you.
          </p>
          <a href="/explore" className="btn ghost">
            Just browse creators first →
          </a>
          {isDev && (
            <p className="dev-note small">
              Dev mode: <a href="/auth/dev?intent=fan&returnTo=%2Fexplore">sign in as a test fan</a>.
            </p>
          )}
        </>
      )}
    </div>
  );
}
