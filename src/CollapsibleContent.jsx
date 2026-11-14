import { useId, useState } from "react";
import CollapseToggle from "./CollapseToggle.jsx";
import { identity } from "./i18n.js";
import { style as s } from "./jsonStyles.js";

/** Keeps children mounted and visible in print, regardless of screen state. */
export default function CollapsibleContent({
  children,
  opening,
  closing,
  contentStyle,
  collapsible = true,
  initiallyExpanded = false,
  label = "JSON",
  t = identity,
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const contentId = useId();
  const collapsed = collapsible && !expanded;

  return (
    <>
      <span>
        {collapsible && (
          <CollapseToggle
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
            controls={contentId}
            label={label}
            t={t}
          />
        )}
        {opening}
      </span>
      {collapsed && <span css={s.collapsedSummary} aria-hidden="true" />}
      <span
        id={contentId}
        css={[contentStyle, collapsed && s.collapsedContent]}
      >
        {children}
      </span>
      {closing}
    </>
  );
}
