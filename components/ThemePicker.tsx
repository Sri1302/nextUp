import { THEMES, THEME_KEYS } from "@/lib/types";
import { themeKey } from "@/lib/format";

// Colour swatches for the creator page; submitted as "theme".
export default function ThemePicker({ theme, handle }: { theme: string; handle: string }) {
  const current = themeKey({ theme, handle });
  return (
    <fieldset className="field">
      <legend>Page colour</legend>
      <div className="swatches">
        {THEME_KEYS.map((k) => (
          <label key={k} className="swatch" title={THEMES[k].label}>
            <input type="radio" name="theme" value={k} defaultChecked={k === current} />
            <span style={{ background: THEMES[k].bg, color: THEMES[k].accent }}>
              <i style={{ background: THEMES[k].accent }} />
            </span>
            <small>{THEMES[k].label}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
