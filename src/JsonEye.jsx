import { useCallback, useMemo } from "react";
import JsonObject from "./JsonObject.jsx";
import { identity } from "./i18n.js";
import { defaultTheme } from "./defaultTheme.js";
import { resolveTheme } from "./resolveTheme.js";
import { style as s } from "./jsonStyles.js";
import { isRecord, isRenderNode, visibleEntries } from "./dataNodes.js";

function RootSection({ sectionKey, sectionRef, metadata, value, ...props }) {
  const elementRef = useCallback(
    (element) => {
      sectionRef?.(sectionKey, element);
    },
    [sectionKey, sectionRef],
  );
  return (
    <JsonObject
      {...props}
      value={{
        renderer: "section",
        props: { ...metadata, elementRef: sectionRef ? elementRef : undefined },
        value,
      }}
    />
  );
}

/** Optional section metadata decorates root keys without changing the data. */
export default function JsonEye({
  data,
  t = identity,
  renderers,
  sections,
  expanded,
  onExpandedChange,
  sectionRef,
  className,
  theme,
}) {
  const variables = useMemo(
    () => (theme ? resolveTheme(theme) : defaultTheme),
    [theme],
  );
  const hasSections =
    isRecord(sections) && isRecord(data) && !isRenderNode(data);
  return (
    <div
      css={[variables, s.container, s.jsonObject, hasSections && s.sections]}
      className={className}
    >
      {hasSections ? (
        visibleEntries(data).map(([key, value]) => {
          const metadata = Object.hasOwn(sections, key)
            ? sections[key]
            : undefined;
          return (
            <RootSection
              key={key}
              sectionKey={key}
              sectionRef={sectionRef}
              metadata={metadata}
              value={value}
              t={t}
              renderers={renderers}
              expanded={
                isRecord(expanded)
                  ? Object.hasOwn(expanded, key) &&
                    typeof expanded[key] === "boolean"
                    ? expanded[key]
                    : true
                  : undefined
              }
              onExpandedChange={
                onExpandedChange
                  ? (nextExpanded) => onExpandedChange(key, nextExpanded)
                  : undefined
              }
              label={t(key)}
            />
          );
        })
      ) : (
        <JsonObject value={data} t={t} renderers={renderers} />
      )}
    </div>
  );
}
