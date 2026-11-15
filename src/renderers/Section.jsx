import { useState } from "react";
import { contentValue, isObject, visibleEntries } from "../dataNodes.js";
import DocumentSection from "../DocumentSection.jsx";
import { identity } from "../i18n.js";
import Icon from "./Icon.jsx";
import { style as s } from "../jsonStyles.js";

/** Generic section; the optional icon is a direct image path. */
export default function Section({
  title = "Section",
  icon,
  children,
  value,
  render,
  collapsible = true,
  initiallyExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  t = identity,
  className,
  elementRef,
}) {
  const [internalExpanded, setExpanded] = useState(initiallyExpanded);
  const expanded = controlledExpanded ?? internalExpanded;
  const content = contentValue(value);
  const canCollapse =
    Boolean(render) &&
    collapsible &&
    isObject(content) &&
    visibleEntries(content).length > 0;
  const changeExpanded = (nextExpanded) => {
    if (controlledExpanded === undefined) setExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };
  return (
    <DocumentSection
      elementRef={elementRef}
      className={className}
      expanded={expanded}
      onToggle={canCollapse ? () => changeExpanded(!expanded) : undefined}
      title={
        <>
          <Icon src={icon} css={s.sectionIcon} />
          {t(title)}
        </>
      }
    >
      {canCollapse
        ? render(value, { expanded, onExpandedChange: changeExpanded })
        : children}
    </DocumentSection>
  );
}
