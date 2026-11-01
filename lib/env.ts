// Settings pasted into hosting dashboards often pick up stray spaces or line breaks;
// read every value through here so they can't break OAuth URLs or connections.
export function env(name: string) {
  const v = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  return v || undefined;
}

export function appUrl() {
  return env("APP_URL")?.replace(/\/$/, "");
}

// Public URL used for canonical links and the sitemap. On Vercel, falls back to the project's production domain.
export function siteUrl() {
  const vercel = env("VERCEL_PROJECT_PRODUCTION_URL");
  return appUrl() || (vercel ? `https://${vercel}` : "http://localhost:3000");
}
