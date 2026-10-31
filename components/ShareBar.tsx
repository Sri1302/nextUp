"use client";

import { useState } from "react";

export default function ShareBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; the link is still selectable
    }
  }

  return (
    <div className="share">
      <div>
        <div className="small muted">Your public timeline: put it in your Instagram bio or YouTube description</div>
        <code className="share-url">{url}</code>
      </div>
      <button className="btn small" onClick={copy}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
