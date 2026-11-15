# Changelog

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
