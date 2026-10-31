"use client";

import { useState } from "react";
import { avatarHue } from "@/lib/format";

// Platform avatar if we have one, otherwise (or if the image URL expired) a colored initial.
export default function Avatar({
  name,
  handle,
  url,
  size = 64,
}: {
  name: string;
  handle: string;
  url?: string | null;
  size?: number;
}) {
  const [broken, setBroken] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.42 };

  if (url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="avatar"
        src={url}
        alt=""
        style={style}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }

  const hue = avatarHue(handle);
  return (
    <div
      className="avatar"
      style={{
        ...style,
        background: `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${(hue + 50) % 360} 80% 50%))`,
      }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
