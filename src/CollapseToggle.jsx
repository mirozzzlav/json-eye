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
      <span aria-hidden="true" css={s.collapseIcon} />
    </button>
  );
}
