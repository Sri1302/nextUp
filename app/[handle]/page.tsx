import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { signOut } from "@/app/actions";
import * as data from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import { compactNumber, themeKey, themeVars, voteLoginHref } from "@/lib/format";
import { CATEGORIES, THEMES, isCategory } from "@/lib/types";
import { MonoIcon } from "@/components/BrandIcons";
import HeroPhoto from "@/components/HeroPhoto";
import PublicTimeline from "@/components/PublicTimeline";
import ShareButton from "@/components/ShareButton";

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
  const theme = themeKey(creator);
  const cats = creator.categories.filter(isCategory);
  const unit = creator.platform === "youtube" ? "subscribers" : "followers";

  return (
    <div className={`cp ${THEMES[theme].dark ? "cp-dark" : ""}`} style={themeVars(theme)}>
      {creator.avatarUrl && <div className="cp-backdrop" style={{ backgroundImage: `url("${creator.avatarUrl}")` }} aria-hidden />}

      <main className="cp-col">
        <header className="cp-hero">
          <HeroPhoto url={creator.avatarUrl} name={creator.name} className="cp-photo" />
          <div className="cp-fade" />
          <nav className="cp-top">
            <Link href="/" className="cp-chip cp-logo" aria-label="NextUp home">
              <span className="logo-mark" aria-hidden>
                ▲
              </span>
              NextUp
            </Link>
            {isOwner ? (
              <Link href="/dashboard" className="cp-chip">
                Dashboard
              </Link>
            ) : viewer ? (
              <form action={signOut}>
                <input type="hidden" name="returnTo" value={path} />
                <button className="cp-chip">Sign out</button>
              </form>
            ) : (
              <a href={loginHref} className="cp-chip">
                Sign in to vote
              </a>
            )}
          </nav>
        </header>

        <section className="cp-intro">
          <h1>{creator.name}</h1>
          <p className="cp-sub">
            @{creator.handle}
            {creator.followerCount != null && (
              <>
                {" · "}
                {compactNumber(creator.followerCount)} {unit}
              </>
            )}
          </p>
          {creator.bio && <p className="cp-bio">{creator.bio}</p>}

          <div className="cp-icons">
            {creator.channelUrl && (
              <a
                className="cp-icon"
                href={creator.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={creator.platform === "youtube" ? "YouTube channel" : "Instagram profile"}
              >
                <MonoIcon name={creator.platform} />
              </a>
            )}
            <ShareButton title={`Vote on what ${creator.name} makes next`} className="cp-icon" />
            <Link className="cp-icon" href="/explore" aria-label="Explore more creators">
              <MonoIcon name="explore" />
            </Link>
          </div>

          {cats.length > 0 && (
            <div className="cp-tags">
              {cats.map((c) => (
                <span key={c} className="cp-tag">
                  {CATEGORIES[c].emoji} {CATEGORIES[c].label}
                </span>
              ))}
            </div>
          )}

          {isOwner && <p className="cp-owner">👀 This is how your fans see your page</p>}
        </section>

        <PublicTimeline items={items} platform={creator.platform} loginHref={viewer ? null : loginHref} />

        <footer className="cp-foot">
          <Link href="/" className="cp-make">
            <span className="logo-mark" aria-hidden>
              ▲
            </span>
            Create your NextUp
          </Link>
          <p>
            <Link href="/explore">Explore</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
