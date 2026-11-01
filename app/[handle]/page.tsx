import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import { voteLoginHref } from "@/lib/format";
import Avatar from "@/components/Avatar";
import { CategoryTags, Followers, PlatformBadge } from "@/components/Bits";
import PublicTimeline from "@/components/PublicTimeline";
import SiteNav from "@/components/SiteNav";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ handle: string }> };

// Public pages live at /@handle.
async function creatorFromParams(params: Props["params"]) {
  const raw = decodeURIComponent((await params).handle);
  if (!raw.startsWith("@")) return undefined;
  return data.getCreatorByHandle(raw.slice(1));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const creator = await creatorFromParams(params);
  if (!creator) return { title: "Not found · NextUp" };
  const title = `What should ${creator.name} make next?`;
  const description = creator.bio || `Vote on ${creator.name}'s upcoming content on NextUp.`;
  return {
    title: `${title} · NextUp`,
    description,
    alternates: { canonical: `/@${creator.handle}` },
    openGraph: { title, description, type: "profile", images: creator.avatarUrl ? [creator.avatarUrl] : [] },
    twitter: { card: "summary", title, description },
  };
}

export default async function CreatorPage({ params }: Props) {
  const creator = await creatorFromParams(params);
  if (!creator) notFound();

  const viewer = await getCurrentUser();
  const items = await data.getItems(creator.id, viewer?.id);
  const isOwner = viewer?.id === creator.userId;
  const path = `/@${creator.handle}`;
  const loginHref = voteLoginHref(path);

  return (
    <>
      <SiteNav>
        <Link href="/explore" className="btn ghost small hide-sm">
          Explore
        </Link>
        {isOwner ? (
          <Link href="/dashboard" className="btn primary small">
            Dashboard
          </Link>
        ) : viewer ? (
          <form action={signOut}>
            <input type="hidden" name="returnTo" value={path} />
            <span className="viewer-chip hide-sm">{viewer.name.split(" ")[0]}</span>
            <button className="btn small">Sign out</button>
          </form>
        ) : (
          <a href={loginHref} className="btn primary small">
            Sign in to vote
          </a>
        )}
      </SiteNav>

      <main className="page public">
        {isOwner && <div className="owner-bar">👀 This is how fans see your page.</div>}

        <section className="profile">
          <div className="profile-cover" />
          <div className="profile-body">
            <div className="avatar-ring">
              <Avatar name={creator.name} handle={creator.handle} url={creator.avatarUrl} size={92} />
            </div>
            <h1>{creator.name}</h1>
            <div className="row wrap gap-sm center">
              <span className="muted">@{creator.handle}</span>
              <PlatformBadge platform={creator.platform} />
              <Followers count={creator.followerCount} platform={creator.platform} />
            </div>
            <CategoryTags categories={creator.categories} />
            {creator.bio && <p className="bio">{creator.bio}</p>}
            <div className="profile-actions">
              {!viewer && items.some((i) => i.status !== "done") && (
                <a className="btn accent" href={loginHref}>
                  ▲ Sign in to vote
                </a>
              )}
              {creator.channelUrl && (
                <a className="btn" href={creator.channelUrl} target="_blank" rel="noopener noreferrer">
                  {creator.platform === "youtube" ? "Visit channel" : "Visit profile"} ↗
                </a>
              )}
            </div>
          </div>
        </section>

        <PublicTimeline items={items} platform={creator.platform} loginHref={viewer ? null : loginHref} />

        <footer className="made-with">
          <Link href="/explore">Explore more creators</Link>
          <span>·</span>
          <Link href="/">Made with NextUp</Link>
        </footer>
      </main>
    </>
  );
}
