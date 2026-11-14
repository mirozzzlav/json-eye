import { resolveRenderer } from "./builtinRenderers.js";
import { identity } from "./i18n.js";
import { parsePhotoList, photoListEnd } from "./photoPlaceholders.js";

const parameters = {
  link: ["url", "text"],
};

function splitInlineText(text) {
  const pattern = /%photos\[|%[a-zA-Z][\w-]*(?:;(?:\\.|[^%\\])*)?%/g;
  const parts = [];
  let previous = 0;
  let match;
  while ((match = pattern.exec(text))) {
    const end =
      match[0] === "%photos["
        ? photoListEnd(text, match.index + "%photos".length)
        : pattern.lastIndex;
    // An unterminated photo list owns the rest of the text, including any
    // placeholder-looking strings inside it. Preserve that entire suffix.
    if (end < 0) break;
    parts.push(text.slice(previous, match.index), text.slice(match.index, end));
    previous = end;
    pattern.lastIndex = end;
  }
  parts.push(text.slice(previous));
  return parts;
}

/** Rendering and array layout share placeholder resolution and label translation. */
export function resolveInlineParts(text, t = identity, renderers) {
  return splitInlineText(text).map((part) => {
    const node = parseInlineNode(part);
    const Component = node && resolveRenderer(node.name, renderers);
    if (!Component) return part;
    const children =
      node.name === "link" && node.props.text !== undefined
        ? t(node.props.text)
        : undefined;
    return {
      Component,
      props: node.props,
      children,
      text: node.name === "link" ? (children ?? node.props.url.trim()) : "",
    };
  });
}

export function inlineTextContent(text, t = identity, renderers) {
  return resolveInlineParts(text, t, renderers)
    .map((part) => (typeof part === "string" ? part : part.text))
    .join("");
}

/** Backslashes escape delimiters, so values can contain semicolons and percent signs. */
export function parseInlineNode(token) {
  if (!token.startsWith("%") || !token.endsWith("%")) return null;
  if (token.startsWith("%photos[") && token.endsWith("]%")) {
    const items = parsePhotoList(token.slice("%photos".length, -1));
    return items ? { name: "photos", props: { items } } : null;
  }
  const parts = [];
  let part = "";
  const body = token.slice(1, -1);
  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (char === "\\" && index + 1 < body.length) {
      part += char + body[++index];
    } else if (char === ";") {
      parts.push(part);
      part = "";
    } else {
      part += char;
    }
  }
  parts.push(part);
  const name = parts.shift().trim();
  if (!Object.hasOwn(parameters, name)) return null;
  const props = Object.create(null);
  for (const entry of parts) {
    const equals = entry.indexOf("=");
    if (equals < 1) return null;
    const key = entry.slice(0, equals).trim();
    if (!parameters[name].includes(key) || Object.hasOwn(props, key))
      return null;
    props[key] = entry.slice(equals + 1).replace(/\\([\\;%])/g, "$1");
  }
  if (!props.url?.trim()) return null;
  return { name, props };
}
