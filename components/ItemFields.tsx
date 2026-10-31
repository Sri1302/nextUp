import { STATUSES, STATUS_LABEL, type Item } from "@/lib/types";

// Shared inputs for the add and edit forms.
export default function ItemFields({ item, showDoneUrl }: { item?: Item; showDoneUrl?: boolean }) {
  return (
    <>
      <label className="field">
        <span>What are you planning?</span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={item?.title}
          placeholder="e.g. Japan on $50 a day"
        />
      </label>
      <label className="field">
        <span>Short description (optional)</span>
        <textarea
          name="description"
          rows={2}
          maxLength={500}
          defaultValue={item?.description}
          placeholder="Tell fans what this will be about"
        />
      </label>
      <div className="row wrap">
        <label className="field grow">
          <span>Status</span>
          <select name="status" defaultValue={item?.status ?? "idea"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field grow">
          <span>Target month (optional)</span>
          <input type="month" name="targetMonth" defaultValue={item?.targetMonth} />
        </label>
      </div>
      {showDoneUrl && (
        <label className="field">
          <span>Link to the finished video or post</span>
          <input name="doneUrl" defaultValue={item?.doneUrl} placeholder="youtube.com/watch?v=… or instagram.com/reel/…" />
        </label>
      )}
    </>
  );
}
