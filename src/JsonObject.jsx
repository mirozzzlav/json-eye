import { createElement } from "react";
import CollapsibleContent from "./CollapsibleContent.jsx";
import {
  isObject,
  isRenderNode,
  visibleEntries,
  contentValue,
} from "./dataNodes.js";
import { identity } from "./i18n.js";
import { resolveRenderer } from "./builtinRenderers.js";
import { style as s } from "./jsonStyles.js";
import TextValue from "./TextValue.jsx";
import { inlineTextContent } from "./inlineNodes.js";

const maxInlineArrayValueLength = 30;

function isLongArrayValue(value, t, renderers) {
  const text =
    (typeof value === "string"
      ? inlineTextContent(t(value), t, renderers)
      : JSON.stringify(value)) ?? "";
  return text.length > maxInlineArrayValueLength || text.includes("\n");
}

export default function JsonObject({
  value,
  t = identity,
  renderers,
  collapsible = true,
  initiallyExpanded = true,
  expanded,
  onExpandedChange,
  label = "JSON",
}) {
  if (isRenderNode(value)) {
    const render = (data) => (
      <JsonObject
        value={data}
        t={t}
        renderers={renderers}
        collapsible={collapsible}
        initiallyExpanded={initiallyExpanded}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        label={label}
      />
    );
    const Component = resolveRenderer(value.renderer, renderers);
    // Unknown renderer names fall back to their content; metadata stays out of the output.
    if (!Component) return render(value.value);
    return createElement(
      Component,
      { ...value.props, value: value.value, t, render },
      value.value === undefined ? undefined : render(value.value),
    );
  }
  if (!isObject(value)) {
    return typeof value === "string" ? (
      <TextValue text={t(value)} t={t} renderers={renderers} />
    ) : (
      JSON.stringify(value)
    );
  }

  return (
    <JsonContainer
      value={value}
      t={t}
      renderers={renderers}
      collapsible={collapsible}
      initiallyExpanded={initiallyExpanded}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      label={label}
    />
  );
}

function JsonContainer({
  value,
  t,
  renderers,
  collapsible,
  label,
  initiallyExpanded,
  expanded,
  onExpandedChange,
}) {
  const isArray = Array.isArray(value);
  const entries = visibleEntries(value).map(([key, item]) => ({
    key,
    item,
    content: contentValue(item),
  }));
  const canCollapse = collapsible && entries.length > 0;
  const inlineArray =
    isArray && entries.every(({ content }) => !isObject(content));
  const hasLongValues =
    inlineArray &&
    entries.some(({ content }) => isLongArrayValue(content, t, renderers));

  return (
    <>
      {hasLongValues && <br />}
      <CollapsibleContent
        collapsible={canCollapse}
        initiallyExpanded={initiallyExpanded}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        label={label}
        t={t}
        opening={<strong>{isArray ? "[" : "{"}</strong>}
        closing={<strong>{isArray ? "]" : "}"}</strong>}
        contentStyle={hasLongValues && s.jsonArrayValues}
      >
        {entries.map(({ key, item, content }, index) => (
          <span
            css={
              inlineArray
                ? [s.jsonInlineValue, hasLongValues && s.jsonLongValue]
                : [s.jsonProperty, isArray && isObject(content) && s.jsonItem]
            }
            key={key}
          >
            {!isArray && (
              <>
                <span css={s.jsonKey}>{t(key)}</span>
                {": "}
              </>
            )}
            <JsonObject
              value={item}
              t={t}
              renderers={renderers}
              collapsible={collapsible}
              label={isArray ? `${label} ${Number(key) + 1}` : t(key)}
            />
            {index < entries.length - 1 ? (inlineArray ? ", " : ",") : ""}
          </span>
        ))}
      </CollapsibleContent>
    </>
  );
}
