"use client";

import { useState } from "react";
import { deleteItem, updateItem } from "@/app/actions";
import type { ItemWithVotes } from "@/lib/types";
import { monthLabel } from "@/lib/format";
import { StatusPill } from "./Bits";
import ItemFields from "./ItemFields";
import SubmitButton from "./SubmitButton";

export default function ItemEditor({ item, rank }: { item: ItemWithVotes; rank: number }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="card item editing">
        <form
          action={async (fd) => {
            await updateItem(fd);
            setEditing(false);
          }}
          className="stack"
        >
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} showDoneUrl />
          <div className="row">
            <SubmitButton>Save</SubmitButton>
            <button type="button" className="btn ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <span className="grow" />
            <button
              type="submit"
              formAction={deleteItem}
              className="btn danger"
              onClick={(e) => {
                if (!confirm(`Delete "${item.title}"? Its votes will be lost.`)) e.preventDefault();
              }}
            >
              Delete
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`card item stripe ${item.status}`}>
      <div className="rank">#{rank}</div>
      <div className="grow">
        <div className="row wrap gap-sm">
          <StatusPill status={item.status} />
          <span className="small muted">{monthLabel(item.targetMonth)}</span>
        </div>
        <h3>{item.title}</h3>
        {item.description && <p className="muted">{item.description}</p>}
        {item.status === "done" && !item.doneUrl && (
          <p className="small warn">Add the link to the finished video so fans can see it.</p>
        )}
      </div>
      <div className="vote-badge">
        <span>▲</span>
        <strong>{item.votes}</strong>
      </div>
      <button className="btn small ghost" onClick={() => setEditing(true)}>
        Edit
      </button>
    </li>
  );
}
