import JsonObject from "./JsonObject.jsx";
import { identity } from "./i18n.js";
import { style as s } from "./jsonStyles.js";
import { isRecord, isRenderNode, visibleEntries } from "./dataNodes.js";

/** Optional section metadata decorates root keys without changing the data. */
export default function JsonEye({
  data,
  t = identity,
  renderers,
  sections,
  className,
}) {
  const hasSections =
    isRecord(sections) && isRecord(data) && !isRenderNode(data);
  return (
    <div css={[s.container, s.jsonObject]} className={className}>
      {hasSections ? (
        visibleEntries(data).map(([key, value]) => {
          const metadata = Object.hasOwn(sections, key)
            ? sections[key]
            : undefined;
          return (
            <JsonObject
              key={key}
              value={{ renderer: "section", props: metadata, value }}
              t={t}
              renderers={renderers}
              initiallyExpanded={
                typeof metadata?.expanded === "boolean"
                  ? metadata.expanded
                  : true
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
