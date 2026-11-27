"use client";

import { useState } from "react";
import { THEMES, THEME_KEYS, type ThemeKey } from "@/lib/types";
import { themeVars } from "@/lib/format";

const FORM_ID = "claim-builder";
const PLACEHOLDERS = ["e.g. My desk setup tour", "e.g. 24 hours in a new city", "e.g. Answering your questions"];

const cleanHandle = (s: string) => s.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 30);

// Homepage hero: claim a handle, and see your own page take shape as you type.
// The handle, colour and ideas are sent along with sign-in, so the page is ready when you land.
export default function PageBuilder({ compact = false }: { compact?: boolean }) {
  const [handle, setHandle] = useState("");
  const [theme, setTheme] = useState<ThemeKey>("lilac");
  const [ideas, setIdeas] = useState(["", "", ""]);
  const [votes, setVotes] = useState([false, false, false]);

  const h = cleanHandle(handle);
  const name = h || "yourname";
  const filled = ideas.filter((i) => i.trim()).length;

  return (
    <div className={`builder ${compact ? "compact" : ""}`}>
      <form className="claim" action="/auth/google" method="get" id={FORM_ID}>
        <input type="hidden" name="intent" value="creator" />
        <input type="hidden" name="theme" value={theme} />
        <label className="claim-field">
          <span className="claim-prefix">nextup/@</span>
          <input
            name="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourname"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={31}
            pattern="@?[A-Za-z0-9._]{3,30}"
            title="3–30 letters, numbers, dots or underscores"
            aria-label="Choose your NextUp handle"
          />
        </label>
        <button className="claim-btn">
          <span className="claim-long">Claim your page</span>
          <span className="claim-short">Claim</span> <span aria-hidden>→</span>
        </button>
      </form>

      <div className="builder-stage">
        {!compact && (
        <div className="builder-steps" aria-hidden>
          <p className={h ? "done" : ""}>
            <b>1</b> Type your handle
          </p>
          <p className={filled ? "done" : ""}>
            <b>2</b> Add ideas you&apos;re planning
          </p>
          <p>
            <b>3</b> Pick a colour, then claim it
          </p>
        </div>
        )}

        <div className="phone" style={themeVars(theme)} aria-label="Live preview of your NextUp page">
          <div className="phone-hero">
            <div className="phone-photo photo-fallback">
              <span>{name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="phone-fade" />
          </div>
          <div className="phone-body">
            <strong className={h ? "" : "ghost"}>{name}</strong>
            <span>nextup/@{name}</span>
            <div className="phone-label">Vote on what&apos;s next</div>
            {ideas.map((idea, i) => (
              <div key={i} className="phone-card">
                <div>
                  <em>Idea</em>
                  <input
                    form={FORM_ID}
                    name="idea"
                    value={idea}
                    maxLength={120}
                    placeholder={PLACEHOLDERS[i]}
                    aria-label={`Video idea ${i + 1}`}
                    onChange={(e) => setIdeas((all) => all.map((v, j) => (j === i ? e.target.value : v)))}
                  />
                </div>
                <button
                  type="button"
                  className={votes[i] ? "on" : ""}
                  aria-pressed={votes[i]}
                  aria-label="Try voting"
                  onClick={() => setVotes((all) => all.map((v, j) => (j === i ? !v : v)))}
                >
                  ▲<br />
                  {votes[i] ? 1 : 0}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="builder-colors">
          <span>Your colour</span>
          <div>
            {THEME_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className={k === theme ? "on" : ""}
                style={{ background: THEMES[k].bg, color: THEMES[k].accent }}
                onClick={() => setTheme(k)}
                aria-label={`${THEMES[k].label} colour`}
                aria-pressed={k === theme}
              >
                <i style={{ background: THEMES[k].accent }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="lp-caption">
        Live preview · type in the phone · tap ▲ to see what fans do
      </p>
    </div>
  );
}
