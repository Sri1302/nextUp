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
