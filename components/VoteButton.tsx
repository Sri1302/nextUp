"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleVote } from "@/app/actions";
import { voteLoginHref } from "@/lib/format";

export default function VoteButton({
  itemId,
  votes,
  voted,
  loginHref,
}: {
  itemId: string;
  votes: number;
  voted: boolean;
  loginHref: string | null; // set when the viewer must sign in to vote
}) {
  const [state, setState] = useState({ votes, voted });
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => setState({ votes, voted }), [votes, voted]);

  if (loginHref) {
    return (
      <a className="vote" href={loginHref} title="Sign in with Google to vote" aria-label="Sign in to vote">
        <span className="arrow">▲</span>
        <span className="count">{votes}</span>
      </a>
    );
  }

  function click() {
    const before = state;
    setNote("");
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
    <div className="vote-wrap">
      <button
        className={`vote ${state.voted ? "on" : ""}`}
        onClick={click}
        disabled={pending}
        aria-pressed={state.voted}
        aria-label={state.voted ? "Remove your vote" : "Vote for this"}
      >
        <span className="arrow">▲</span>
        <span className="count">{state.votes}</span>
      </button>
      {note && <span className="vote-note">{note}</span>}
    </div>
  );
}
