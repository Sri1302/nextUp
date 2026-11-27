"use client";

import { useActionState } from "react";
import { connectYouTube } from "@/app/actions";
import { YouTubeIcon } from "./BrandIcons";
import SubmitButton from "./SubmitButton";

// Shown when a creator's page has no YouTube channel yet (e.g. they unticked the YouTube permission).
// One click re-runs YouTube sign-in, which fills in the channel; pasting a link is the fallback.
export default function ConnectYouTube() {
  const [result, action] = useActionState(connectYouTube, null);
  const ok = result === "connected" || result === "linked";

  return (
    <section className="card connect-yt">
      <div className="add-head">
        <span className="connect-logo" aria-hidden>
          <YouTubeIcon size={22} />
        </span>
        <div>
          <h2>Connect your YouTube channel</h2>
          <p className="muted small">Adds your channel photo, subscriber count and niche to your page. Read-only, nothing is posted.</p>
        </div>
      </div>

      <a href="/auth/google?intent=creator&returnTo=%2Fdashboard" className="btn primary big block connect-one">
        <YouTubeIcon size={18} /> Connect with YouTube
      </a>
      <p className="muted small connect-hint">Choose the Google account that owns your channel and allow &quot;See your YouTube account&quot;.</p>

      <details className="connect-paste">
        <summary>Or paste your channel link instead</summary>
        <form action={action} className="connect-row">
          <input name="channel" placeholder="@yourchannel or youtube.com/@yourchannel" required autoComplete="off" />
          <SubmitButton pendingText="Connecting…" className="btn">
            Connect
          </SubmitButton>
        </form>
      </details>
      {ok && <p className="ok small">✓ Channel connected. Your page is updated.</p>}
      {result && !ok && <p className="error">{result}</p>}
    </section>
  );
}
