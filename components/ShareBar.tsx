"use client";

import { useState } from "react";

export default function ShareBar({ url, path }: { url: string; path: string }) {
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
      <div className="share-label">🔗 Your public timeline · put it in your bio or video description</div>
      <div className="share-row">
        <code className="share-url">{url.replace(/^https?:\/\//, "")}</code>
        <button className={`share-btn ${copied ? "done" : ""}`} onClick={copy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <a className="share-btn ghost" href={path} target="_blank" rel="noopener">
          Open ↗
        </a>
      </div>
    </div>
  );
}
