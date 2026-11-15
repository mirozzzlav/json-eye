import { defaultTheme } from "./defaultTheme.js";

/** Merge only known tokens, without mutating the defaults or the supplied theme. */
export function resolveTheme(overrides) {
  return Object.fromEntries(
    Object.entries(defaultTheme).map(([key, fallback]) => {
      const value =
        overrides && Object.hasOwn(overrides, key) ? overrides[key] : undefined;
      const valid =
        typeof value === "string" ||
        (typeof value === "number" && Number.isFinite(value));
      return [key, valid ? value : fallback];
    }),
  );
}
