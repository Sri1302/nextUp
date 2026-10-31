"use client";

import { useActionState } from "react";
import { deleteAccount, updateProfile } from "@/app/actions";
import type { Creator } from "@/lib/types";
import SubmitButton from "./SubmitButton";

export default function ProfileForm({ creator }: { creator: Creator }) {
  const [result, action] = useActionState(updateProfile, null);

  return (
    <div className="stack">
      <form className="stack" action={action}>
        <label className="field">
          <span>Handle (your link)</span>
          <div className="prefix">
            <span>/@</span>
            <input name="handle" defaultValue={creator.handle} maxLength={30} required autoComplete="off" />
          </div>
        </label>
        <label className="field">
          <span>Display name</span>
          <input name="name" defaultValue={creator.name} maxLength={60} />
        </label>
        <label className="field">
          <span>Bio (shown on your public page)</span>
          <textarea name="bio" rows={2} maxLength={280} defaultValue={creator.bio} />
        </label>
        <div className="row wrap">
          <label className="field grow">
            <span>Main platform</span>
            <select name="platform" defaultValue={creator.platform}>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="field grow">
            <span>Channel / profile link</span>
            <input name="channelUrl" defaultValue={creator.channelUrl} />
          </label>
        </div>
        <div className="row">
          <SubmitButton>Save profile</SubmitButton>
          {result === "saved" && <span className="small ok">Saved</span>}
          {result && result !== "saved" && <span className="error">{result}</span>}
        </div>
      </form>

      <form
        action={deleteAccount}
        className="danger-zone"
        onSubmit={(e) => {
          if (!confirm("Delete your account, timeline and all votes? This can't be undone.")) e.preventDefault();
        }}
      >
        <div>
          <strong>Delete account</strong>
          <p className="muted small">Removes your profile, timeline and votes permanently.</p>
        </div>
        <button className="btn danger">Delete</button>
      </form>
    </div>
  );
}
