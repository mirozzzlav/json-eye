import Photos from "./renderers/Photos.jsx";
import Link from "./renderers/Link.jsx";
import Bold from "./renderers/Bold.jsx";
import Section from "./renderers/Section.jsx";

const builtinRenderers = {
  photos: Photos,
  link: Link,
  bold: Bold,
  section: Section,
};

/** Own registrations override defaults, including explicit null to disable one. */
export function resolveRenderer(name, renderers = {}) {
  if (Object.hasOwn(renderers, name)) return renderers[name];
  return Object.hasOwn(builtinRenderers, name)
    ? builtinRenderers[name]
    : undefined;
}
