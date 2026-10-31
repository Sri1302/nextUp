import type { Platform, Status } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { compactNumber } from "@/lib/format";

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`platform ${platform}`}>{platform === "youtube" ? "YouTube" : "Instagram"}</span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill ${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Followers({ count, platform }: { count: number | null; platform: Platform }) {
  if (count == null) return null;
  return (
    <span className="muted small">
      {compactNumber(count)} {platform === "youtube" ? "subscribers" : "followers"}
    </span>
  );
}
