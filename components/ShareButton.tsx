"use client";

import { useState } from "react";
import { MonoIcon } from "./BrandIcons";

// Native share sheet on phones, copy-link everywhere else.
export default function ShareButton({ title, className }: { title: string; className: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // share sheet dismissed or clipboard blocked
    }
  }

  return (
    <button type="button" className={className} onClick={share} aria-label="Share this page" title={copied ? "Link copied" : "Share"}>
      <MonoIcon name={copied ? "check" : "share"} />
    </button>
  );
}
