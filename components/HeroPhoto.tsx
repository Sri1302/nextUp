"use client";

import { useState } from "react";

// Big creator photo; falls back to a gradient with their initial when there's no photo or it fails to load.
export default function HeroPhoto({ url, name, className }: { url?: string | null; name: string; className: string }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={url} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
  }
  return (
    <div className={`${className} photo-fallback`} aria-hidden>
      <span>{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
