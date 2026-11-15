import { identity } from "./i18n.js";
import { style as s } from "./jsonStyles.js";

export default function CollapseToggle({
  expanded,
  onToggle,
  controls,
  label,
  t = identity,
}) {
  return (
    <button
      type="button"
      css={s.collapseToggle}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={`${t(expanded ? "collapse" : "expand")} ${label}`}
      onClick={onToggle}
    >
      <svg
        css={s.collapseIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M6 12h12" />
        {!expanded && <path d="M12 6v12" />}
      </svg>
    </button>
  );
}
