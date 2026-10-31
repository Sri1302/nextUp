"use client";

import { useState } from "react";
import { GoogleIcon, InstagramIcon, YouTubeIcon } from "./BrandIcons";

const isDev = process.env.NODE_ENV === "development";

type Role = "creator" | "fan";

// "I'm a creator" / "I'm a fan" picker, then the sign-in options for that role.
export default function SignInButtons({ instagram }: { instagram: boolean }) {
  const [role, setRole] = useState<Role | null>(null);

  if (!role) {
    return (
      <div className="stack">
        <h2>How will you use NextUp?</h2>
        <div className="roles">
          <button className="role-card" onClick={() => setRole("creator")}>
            <span className="role-emoji" aria-hidden>🎬</span>
            <strong>I'm a creator</strong>
            <span>Share my content timeline and see what fans want</span>
            <span className="go" aria-hidden>→</span>
          </button>
          <button className="role-card" onClick={() => setRole("fan")}>
            <span className="role-emoji" aria-hidden>🙋</span>
            <strong>I'm a fan</strong>
            <span>Vote on what my favourite creators make next</span>
            <span className="go" aria-hidden>→</span>
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
          <h2>Sign in as a creator</h2>
          <a href="/auth/google?intent=creator" className="btn oauth">
            <span className="oauth-logo"><YouTubeIcon size={20} /></span>
            Continue with YouTube
            <span className="oauth-arrow" aria-hidden>→</span>
          </a>
          {instagram && (
            <a href="/auth/instagram?intent=creator" className="btn oauth">
              <span className="oauth-logo"><InstagramIcon size={26} /></span>
              Continue with Instagram
              <span className="oauth-arrow" aria-hidden>→</span>
            </a>
          )}
          <p className="muted small">
            {instagram
              ? "YouTube uses your Google account. Instagram needs a Business or Creator account. "
              : "YouTube uses your Google account. Instagram sign-in is coming soon. "}
            We only read your public profile and never post for you.
          </p>
          {isDev && (
            <p className="dev-note">
              Dev mode: <a href="/auth/dev?intent=creator">sign in as a test creator</a>
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Sign in as a fan</h2>
          <a href="/auth/google?intent=fan&returnTo=%2Fexplore" className="btn oauth">
            <span className="oauth-logo"><GoogleIcon size={24} /></span>
            Continue with Google
            <span className="oauth-arrow" aria-hidden>→</span>
          </a>
          <p className="muted small">One account, one vote per idea, so results stay fair.</p>
          <a href="/explore" className="btn ghost">
            Just browse creators first
          </a>
          {isDev && (
            <p className="dev-note">
              Dev mode: <a href="/auth/dev?intent=fan&returnTo=%2Fexplore">sign in as a test fan</a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
