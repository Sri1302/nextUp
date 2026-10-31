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
      <div className="share-label">Your public link · add it to your bio or video description</div>
      <div className="share-row">
        <code className="share-url">{url.replace(/^https?:\/\//, "")}</code>
        <button className={`btn small ${copied ? "copied" : "primary"}`} onClick={copy}>
          {copied ? "✓ Copied" : "Copy link"}
        </button>
        <a className="btn small" href={path} target="_blank" rel="noopener">
          Open ↗
        </a>
      </div>
    </div>
  );
}
