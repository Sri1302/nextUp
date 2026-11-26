"use client";

import { useActionState } from "react";
import { connectYouTube } from "@/app/actions";
import { YouTubeIcon } from "./BrandIcons";
import SubmitButton from "./SubmitButton";

// Links the creator's public YouTube channel: photo, subscribers and niche fill in from YouTube.
export default function ConnectYouTube({ connectedUrl }: { connectedUrl?: string }) {
  const [result, action] = useActionState(connectYouTube, null);
  const ok = result === "connected" || result === "linked";

  return (
    <section className="card connect-yt">
      <div className="add-head">
        <span className="connect-logo" aria-hidden>
          <YouTubeIcon size={22} />
        </span>
        <div>
          <h2>{connectedUrl ? "Refresh your YouTube channel" : "Connect your YouTube channel"}</h2>
          <p className="muted small">
            We&apos;ll add your channel photo, subscriber count and niche to your page. Only public info, nothing is posted.
          </p>
        </div>
      </div>
      <form action={action} className="connect-row">
        <input name="channel" placeholder="@yourchannel or youtube.com/@yourchannel" defaultValue={connectedUrl ?? ""} required autoComplete="off" />
        <SubmitButton pendingText="Connecting…" className="btn primary">
          {connectedUrl ? "Refresh" : "Connect"}
        </SubmitButton>
      </form>
      {ok && <p className="ok small">✓ Channel connected. Your page is updated.</p>}
      {result && !ok && <p className="error">{result}</p>}
    </section>
  );
}
