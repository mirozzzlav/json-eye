# Changelog

## 3.0.1

- Added a built-in `bold` renderer and `%bold;Important%` inline placeholder, with translations, local overrides and theme font weight support.
- Fixed trailing commas staying with primitive JSON values when long content wraps.
- Expanded the demo biography in English and Slovak to demonstrate long-text wrapping with inline links.

## 3.0.0

- Breaking: removed section `background` support and its `--mobile-breakpoint` and `--tablet-breakpoint` theme tokens; apply backgrounds in application styles.

- Added `--content-max-width` to constrain and wrap individual JSON values at every nesting depth, including without sections.

- Added photo border width, style, color and radius theme tokens; borders are disabled by default.

- Added accessible section heading buttons that toggle the root JSON container.
- Added `sectionRef(key, element)` for accessing root section DOM elements without internal IDs or routing dependencies.

- Added an instance-local `theme` prop with flat CSS custom-property tokens for all built-in renderers and print styles.
- Exported a token-only `defaultTheme` and migrated the demo to the flat theme API.
- Fixed section refs forwarding callback return values to React.
- Removed the redundant style context and factory; built-in styles share static definitions.
- Fixed the document font being overridden by an internal `font-family: inherit` rule.
- Breaking: removed the `--json-*` CSS variable API; supply appearance overrides through `theme`.

## 2.0.1

- Standalone photos and photo collections now render below their JSON attribute name.
- Removed trailing JSON commas after photo values and preserved spacing between photos in arrays.

## 2.0.0

- Added controlled section expansion through `JsonEye` props `expanded` and `onExpandedChange(key, expanded)`.
- Removed `expanded` from section metadata; use the top-level expansion map instead.

## 1.1.0

- Photos now use square cropping by default; set `square: false` per image to preserve its native aspect ratio.
- Photo collections wrap onto new rows with consistent spacing.
- Centralized renderer style tokens.
- Added an interactive standalone demo with English/Slovak content and light/dark themes.

## 1.0.0

Initial release prepared for npm publication.

- React JSON rendering for objects, arrays and primitive values.
- Separate section metadata for headings, icons, backgrounds and initial collapse state.
- Inline photo and link placeholders, with local renderer overrides.
- Translation helper with English and original-token fallbacks.
- Accessible collapse controls and print styles that show all content.
- ESM bundle with React, React DOM and Emotion as peer dependencies.
