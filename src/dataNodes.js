export const isObject = (value) => value !== null && typeof value === "object";
export const isRecord = (value) => isObject(value) && !Array.isArray(value);

/** A string renderer is the explicit marker for a rendering node. */
export function isRenderNode(value) {
  return (
    isRecord(value) &&
    Object.hasOwn(value, "renderer") &&
    typeof value.renderer === "string"
  );
}

export function visibleEntries(value) {
  return Object.entries(value).filter(([, item]) => item !== undefined);
}

/** Rendering nodes contribute their content, not their props, to array layout. */
export function contentValue(value) {
  return isRenderNode(value) ? contentValue(value.value) : value;
}
