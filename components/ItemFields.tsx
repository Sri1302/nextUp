import { STATUSES, STATUS_LABEL, type Item, type Status } from "@/lib/types";
import { monthLabel } from "@/lib/format";

export const STATUS_EMOJI: Record<Status, string> = {
  idea: "💡",
  planned: "🗓️",
  in_progress: "🎬",
  done: "✅",
};

function upcomingMonths(count = 18) {
  const d = new Date();
  d.setDate(1);
  return Array.from({ length: count }, (_, i) => {
    const m = new Date(d.getFullYear(), d.getMonth() + i, 1);
    return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
  });
}

// Shared inputs for the add and edit forms.
export default function ItemFields({ item, showDoneUrl }: { item?: Item; showDoneUrl?: boolean }) {
  const months = upcomingMonths();
  if (item?.targetMonth && !months.includes(item.targetMonth)) months.unshift(item.targetMonth);

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
        <span>
          Short description <em>optional</em>
        </span>
        <textarea
          name="description"
          rows={2}
          maxLength={500}
          defaultValue={item?.description}
          placeholder="Tell fans what this will be about"
        />
      </label>
      <fieldset className="field">
        <legend>Status</legend>
        <div className="chips">
          {STATUSES.map((s) => (
            <label key={s} className={`chip ${s}`}>
              <input type="radio" name="status" value={s} defaultChecked={(item?.status ?? "idea") === s} />
              <span>
                {STATUS_EMOJI[s]} {STATUS_LABEL[s]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>
          When? <em>optional</em>
        </span>
        <select name="targetMonth" defaultValue={item?.targetMonth ?? ""}>
          <option value="">Someday / not sure yet</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </label>
      {showDoneUrl && (
        <label className="field">
          <span>Link to the finished video or post</span>
          <input name="doneUrl" defaultValue={item?.doneUrl} placeholder="youtube.com/watch?v=… or instagram.com/reel/…" />
        </label>
      )}
    </>
  );
}
