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
  expanded: controlledExpanded,
  onExpandedChange,
  label = "JSON",
  t = identity,
}) {
  const [internalExpanded, setExpanded] = useState(initiallyExpanded);
  const expanded = controlledExpanded ?? internalExpanded;
  const contentId = useId();
  const collapsed = collapsible && !expanded;

  return (
    <>
      <span>
        {collapsible && (
          <CollapseToggle
            expanded={expanded}
            onToggle={() => {
              const nextExpanded = !expanded;
              if (controlledExpanded === undefined) setExpanded(nextExpanded);
              onExpandedChange?.(nextExpanded);
            }}
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
