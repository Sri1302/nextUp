import type { CSSProperties } from "react";
import { THEMES, THEME_KEYS, isTheme, type ThemeKey } from "./types";

export function monthLabel(ym: string) {
  if (!ym) return "Someday";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}

export function avatarHue(handle: string) {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function voteLoginHref(returnTo: string) {
  return `/auth/google?intent=fan&returnTo=${encodeURIComponent(returnTo)}`;
}

// A creator's page theme: their chosen one, or a light theme picked from their handle.
export function themeKey(c: { theme: string; handle: string }): ThemeKey {
  if (isTheme(c.theme)) return c.theme;
  const light = THEME_KEYS.filter((k) => !THEMES[k].dark);
  return light[avatarHue(c.handle) % light.length];
}

export function themeVars(key: ThemeKey): CSSProperties {
  const t = THEMES[key];
  return {
    "--cp-bg": t.bg,
    "--cp-card": t.card,
    "--cp-accent": t.accent,
    "--cp-text": t.text,
    "--cp-muted": t.muted,
  } as CSSProperties;
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m?.[1];
}
