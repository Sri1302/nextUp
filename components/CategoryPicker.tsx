"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_KEYS, MAX_CATEGORIES, type Category } from "@/lib/types";

// Multi-select chips (up to MAX_CATEGORIES) submitted as repeated "categories" fields.
export default function CategoryPicker({ initial }: { initial: string[] }) {
  const [picked, setPicked] = useState<string[]>(initial);
  const full = picked.length >= MAX_CATEGORIES;

  function toggle(c: Category) {
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : full ? p : [...p, c]));
  }

  return (
    <fieldset className="field">
      <legend>
        What do you make? <em>pick up to {MAX_CATEGORIES} · {picked.length}/{MAX_CATEGORIES}</em>
      </legend>
      <div className="chips">
        {CATEGORY_KEYS.map((c) => {
          const on = picked.includes(c);
          return (
            <label key={c} className={`chip cat ${!on && full ? "dim" : ""}`}>
              <input type="checkbox" name="categories" value={c} checked={on} onChange={() => toggle(c)} />
              <span>
                {CATEGORIES[c].emoji} {CATEGORIES[c].label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
