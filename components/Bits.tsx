import type { Platform, Status } from "@/lib/types";
import { CATEGORIES, STATUS_LABEL, isCategory } from "@/lib/types";
import { compactNumber } from "@/lib/format";
import { InstagramIcon, YouTubeIcon } from "./BrandIcons";

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="platform">
      {platform === "youtube" ? <YouTubeIcon size={12} /> : <InstagramIcon size={14} />}
      {platform === "youtube" ? "YouTube" : "Instagram"}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
}

export function CategoryTags({ categories }: { categories: string[] }) {
  const known = categories.filter(isCategory);
  if (!known.length) return null;
  return (
    <span className="tags">
      {known.map((c) => (
        <span key={c} className="tag">
          {CATEGORIES[c].emoji} {CATEGORIES[c].label}
        </span>
      ))}
    </span>
  );
}

export function Followers({ count, platform }: { count: number | null; platform: Platform }) {
  if (count == null) return null;
  return (
    <span className="muted small">
      {compactNumber(count)} {platform === "youtube" ? "subscribers" : "followers"}
    </span>
  );
}
