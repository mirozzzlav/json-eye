import { Fragment } from "react";
import { identity } from "./i18n.js";
import { resolveInlineParts } from "./inlineNodes.js";

const escaped = (text) => JSON.stringify(text).slice(1, -1);

/** Inline placeholders use built-ins or local overrides; parameters never become HTML. */
export default function TextValue({ text, t = identity, renderers }) {
  const parts = resolveInlineParts(text, t, renderers);
  const renderPart = (part) => {
    if (typeof part === "string") return escaped(part);
    const { Component, props, children } = part;
    return (
      <Component {...props} t={t}>
        {children}
      </Component>
    );
  };
  if (
    parts.length === 3 &&
    !parts[0] &&
    !parts[2] &&
    typeof parts[1] !== "string"
  ) {
    return renderPart(parts[1]);
  }
  return (
    <>
      {'"'}
      {parts.map((part, index) => (
        <Fragment key={index}>{renderPart(part)}</Fragment>
      ))}
      {'"'}
    </>
  );
}
