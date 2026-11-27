import Link from "next/link";
import type { CreatorListing } from "@/lib/data";
import { compactNumber, themeKey, themeVars } from "@/lib/format";
import { CATEGORIES, isCategory } from "@/lib/types";
import HeroPhoto from "./HeroPhoto";
import { MonoIcon } from "./BrandIcons";

// Portrait creator card used on the homepage and Explore.
export default function CreatorCard({ c }: { c: CreatorListing }) {
  const cats = c.categories.filter(isCategory).slice(0, 2);
  return (
    <Link href={`/@${c.handle}`} className="pc" style={themeVars(themeKey(c))}>
      <HeroPhoto url={c.avatarUrl} name={c.name} className="pc-photo" />
      <div className="pc-shade" />
      <span className="pc-platform" aria-label={c.platform === "youtube" ? "YouTube" : "Instagram"}>
        <MonoIcon name={c.platform} size={14} />
      </span>
      <div className="pc-info">
        <strong>{c.name}</strong>
        <span className="pc-handle">askfans.online/@{c.handle}</span>
        <span className="pc-stats">
          {cats.map((k) => CATEGORIES[k].emoji).join(" ")}
          {cats.length ? " · " : ""}▲ {compactNumber(c.voteCount)} votes
          {c.followerCount != null ? ` · ${compactNumber(c.followerCount)} subs` : ""}
        </span>
      </div>
    </Link>
  );
}
