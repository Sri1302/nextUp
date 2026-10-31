import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import { voteLoginHref } from "@/lib/format";
import Avatar from "@/components/Avatar";
import { Followers, PlatformBadge } from "@/components/Bits";
import PublicTimeline from "@/components/PublicTimeline";

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

  return (
    <main className="page public">
      {isOwner ? (
        <div className="owner-bar">
          This is your public page. <Link href="/dashboard">Back to dashboard</Link>
        </div>
      ) : (
        viewer && (
          <form action={signOut} className="viewer-bar">
            <input type="hidden" name="returnTo" value={path} />
            <span>
              Voting as <strong>{viewer.name || "you"}</strong>
            </span>
            <button className="linklike">Sign out</button>
          </form>
        )
      )}

      <header className="public-head">
        <Avatar name={creator.name} handle={creator.handle} url={creator.avatarUrl} size={84} />
        <h1>{creator.name}</h1>
        <div className="row wrap gap-sm center">
          <span className="muted">@{creator.handle}</span>
          <PlatformBadge platform={creator.platform} />
          <Followers count={creator.followerCount} platform={creator.platform} />
        </div>
        {creator.bio && <p className="bio">{creator.bio}</p>}
        {creator.channelUrl && (
          <a className="btn small ghost" href={creator.channelUrl} target="_blank" rel="noopener noreferrer">
            {creator.platform === "youtube" ? "Visit channel" : "Visit profile"} ↗
          </a>
        )}
      </header>

      {!viewer && items.some((i) => i.status !== "done") && (
        <a className="btn oauth google signin-to-vote" href={voteLoginHref(path)}>
          <span className="oauth-icon" aria-hidden>G</span>
          Sign in with Google to vote
        </a>
      )}

      <PublicTimeline items={items} platform={creator.platform} loginHref={viewer ? null : voteLoginHref(path)} />

      <footer className="made-with">
        <Link href="/">Made with NextUp: create your own timeline</Link>
      </footer>
    </main>
  );
}
