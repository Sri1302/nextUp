"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleVote } from "@/app/actions";
import { voteLoginHref } from "@/lib/format";

export default function VoteButton({
  itemId,
  votes,
  voted,
  loginHref,
  wide = false,
}: {
  itemId: string;
  votes: number;
  voted: boolean;
  loginHref: string | null; // set when the viewer must sign in to vote
  wide?: boolean; // full-width pill for the featured idea
}) {
  const [state, setState] = useState({ votes, voted });
  const [note, setNote] = useState("");
  const [pop, setPop] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => setState({ votes, voted }), [votes, voted]);

  const cls = `vote ${wide ? "wide" : ""}`;
  const label = (n: number, on: boolean) =>
    wide ? (
      <>
        <span className="arrow">▲</span>
        <span>{on ? "Voted" : "Vote for this"}</span>
        <span className="count">{n}</span>
      </>
    ) : (
      <>
        <span className="arrow">▲</span>
        <span className="count">{n}</span>
      </>
    );

  if (loginHref) {
    return (
      <a className={cls} href={loginHref} title="Sign in with Google to vote" aria-label="Sign in to vote">
        {label(votes, false)}
      </a>
    );
  }

  function click() {
    const before = state;
    setNote("");
    if (!state.voted) {
      setPop(true);
      setTimeout(() => setPop(false), 450);
    }
    setState((s) => ({ voted: !s.voted, votes: s.votes + (s.voted ? -1 : 1) }));
    startTransition(async () => {
      const res = await toggleVote(itemId);
      if ("error" in res) {
        setState(before);
        if (res.error === "auth") window.location.href = voteLoginHref(window.location.pathname);
        else setNote(res.error === "own" ? "You can't vote on your own ideas" : "Voting is closed");
      } else {
        setState(res);
      }
    });
  }

  return (
    <div className={`vote-wrap ${wide ? "wide" : ""}`}>
      <button
        className={`${cls} ${state.voted ? "on" : ""} ${pop ? "pop" : ""}`}
        onClick={click}
        disabled={pending}
        aria-pressed={state.voted}
        aria-label={state.voted ? "Remove your vote" : "Vote for this"}
      >
        {label(state.votes, state.voted)}
      </button>
      {note && <span className="vote-note">{note}</span>}
    </div>
  );
}
