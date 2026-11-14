import Photos from "./renderers/Photos.jsx";
import Link from "./renderers/Link.jsx";
import Section from "./renderers/Section.jsx";

const builtinRenderers = {
  photos: Photos,
  link: Link,
  section: Section,
};

/** Own registrations override defaults, including explicit null to disable one. */
export function resolveRenderer(name, renderers = {}) {
  if (Object.hasOwn(renderers, name)) return renderers[name];
  return Object.hasOwn(builtinRenderers, name)
    ? builtinRenderers[name]
    : undefined;
}
