# JsonEye

React JSON document renderer. Package name: `react-json-eye`.

[Source code](https://github.com/mirozzzlav/json-eye) ·
[Issues](https://github.com/mirozzzlav/json-eye/issues)

Keep data in ordinary JSON and pass presentation separately. Attribute names are
shown in double quotes after translation, with JSON string escaping. `sections` uses the
same first-level keys as `data`; each data property becomes one section.

```jsx
import JsonEye from "react-json-eye";

const data = {
  aboutMe: {
    fullName: "Jane Doe",
    bio: "More at %link;url=example.com;text=my website%.",
    photos: "%photos[{src:/portrait.jpg,alt:Portrait}]%",
  },
  skills: ["React", "JavaScript"],
};

const sections = {
  aboutMe: {
    title: "About me",
    icon: "/icons/profile.svg",
  },
  skills: { title: "Skills", icon: "/icons/skills.svg" },
};

<JsonEye data={data} sections={sections} className="my-document" />;
```

Only `data` is required. `sections`, `expanded`, `onExpandedChange`, `sectionRef`, `t`,
`renderers`, `theme` and `className` are optional. Pass parsed data, not JSON source text.

## Installation

```sh
npm install react-json-eye @emotion/react
```

Use in an application with React and React DOM `^18.3.1` or `^19.0.0`.
Emotion `^11.14.0` is also a peer dependency. The package is ESM-only;
import it from JavaScript modules or a bundler that supports ESM. No separate CSS
import or Emotion Babel configuration is required for the built-in styles.
TypeScript declarations and a CommonJS build are not included.

## Quick start

```jsx
import JsonEye from "react-json-eye";

export default function App() {
  return <JsonEye data={{ name: "Jane Doe", skills: ["React", "JavaScript"] }} />;
}
```

For section headings and icons, pass the separate metadata shown above. Supply
`t` only when using translations; otherwise omit it.

## JsonEye props

| Prop | Default | Description |
| --- | --- | --- |
| `data` | Required | Parsed JSON value to display. |
| `sections` | Omitted | Metadata keyed by root data properties; see below. |
| `expanded` | Omitted | Controlled expansion map keyed by root sections; missing keys default to `true`. |
| `onExpandedChange` | Omitted | Called with `(key, expanded)` when a section toggle is clicked. |
| `sectionRef` | Omitted | Callback `(key, element)` receiving each root section DOM element, or `null` when detached. |
| `t` | Identity function | Translates keys, string values and renderer labels. |
| `renderers` | Built-in renderers | Instance-local component overrides or registrations. |
| `theme` | Built-in theme | Flat CSS tokens, merged with `defaultTheme`. |
| `className` | Omitted | CSS class for the outer document element. |

## Data and sections

With a `sections` object, first-level properties of a plain root object become
sections. Content is taken directly from `data[key]`; heading, icon and other
section presentation props come from `sections[key]`. Data and metadata are never
merged or mutated. Nested objects remain ordinary JSON, not additional sections.

Sections follow data order. Metadata with no matching data key is ignored.
An undefined data entry is omitted. A data key without metadata still gets a
section, with the default title `"Section"` and no icon. An empty `sections`
object uses those defaults for every data key. Empty root data produces no sections.

Section metadata contains presentation only; `sections[key].expanded` is not used.
To control expansion, keep an `expanded` map in the parent and update it through
`onExpandedChange(key, expanded)`:

```jsx
const [expanded, setExpanded] = useState({ aboutMe: true, skills: false });

<JsonEye
  data={data}
  sections={sections}
  expanded={expanded}
  onExpandedChange={(key, nextExpanded) =>
    setExpanded((current) => ({ ...current, [key]: nextExpanded }))
  }
/>;
```

Import `useState` from React. Updating the map changes expansion immediately,
including after mounting. Missing keys default to expanded; `setExpanded({})`
expands all sections. With an `expanded` map supplied, toggles request changes
through the callback; the parent must update the map. Without a callback,
controlled sections only change when the parent changes `expanded`.

Omit `expanded` (or pass `null`) for internal toggle state, initially expanded.
The callback, if supplied, also reports section toggles in this mode.
Expansion props apply only when using a `sections` map and affect each section's
outer JSON container. Clicking a section heading toggles the same root container
as its expand/collapse button; the heading also supports Enter and Space.
Empty containers and primitive values have no toggle.
Nested objects and arrays start expanded and toggle independently; their toggles
do not trigger the section callback. All content stays visible in print.

### Accessing section elements

Use `sectionRef(key, element)` to keep references to root sections without depending
on internal DOM IDs or markup. It applies only when using a `sections` map.

```jsx
const sectionElements = useRef(new Map());
const registerSection = useCallback((key, element) => {
  if (element) sectionElements.current.set(key, element);
  else sectionElements.current.delete(key);
}, []);

<JsonEye data={data} sections={sections} sectionRef={registerSection} />;
```

Import `useRef` and `useCallback` from React. The callback receives the root
`<section>` after mounting and `null` when detached. Expanding or collapsing
keeps that element mounted and does not trigger the callback. Keep the callback
stable to avoid detaching and reattaching refs on rerenders; changing the callback
clears the old ref with `null` and supplies the element to the new callback.
React Strict Mode may perform additional ref setup/cleanup cycles in development.
Refs do not run during server rendering.

The application owns routing and scrolling. After expanding a section, scroll
in an effect after the updated content renders, using the stored element and any
application-specific header offset. Custom `section` renderers receive an
`elementRef` prop: forward it to the built-in `Section`, or attach it as `ref` to
your own root DOM element. No extra wrapper element is added by `sectionRef`.

Without `sections` (or with `sections={null}`), the root uses the same JSON
rendering rules as nested values: objects retain keys and braces, arrays retain
brackets, and primitives render directly. Root arrays, primitives and explicit
renderer nodes also render directly when a `sections` map is supplied.

Primitive arrays render inline; long values start a new line. `undefined` entries
are omitted before comma placement. Ordinary fields such as `value`, `title`,
`props`, `hidden` and `omitComma` have no special meaning in plain JSON.

## Icons

A section's optional `icon` is a direct image path or URL:

```js
const sections = {
  aboutMe: { title: "About me", icon: "/icons/profile.svg" },
};
```

The internal icon renderer displays it as a decorative image with an empty `alt`.
The section renderer supplies the icon's dimensions, decoration and print styling
directly, without application CSS targeting the section's internal HTML structure.
Missing, empty or non-string icons render nothing. Paths are literal and are not
translated or interpolated. No icon dictionary or `icons` prop is needed.

## Text, translations and placeholders

`t(text)` translates JSON keys and string values; it defaults to returning the
input unchanged. After translation, string values can contain inline placeholders
with all parameters supplied directly in the text:

```json
{
  "photos": "%photos[{src:/portrait.jpg,alt:Portrait},{src:/other.jpg,alt:Other portrait}]%",
  "web": "%link;url=example.com;text=My website%",
  "notice": "This is %bold;important%.",
  "message": "Email me at %link;url=hello@example.com%."
}
```

- `photos`: an array of photo objects. Each needs a string `src` and optionally
  a string `alt` and a boolean `square`. `alt` defaults to empty and is translated through `t`.
  `square` defaults to `true`: images are square and cropped with `object-fit: cover`.
  Set `square: false` to preserve an image's native aspect ratio, for example
  `%photos[{src:/landscape.jpg,alt:Landscape,square:false}]%`.
  One image uses a one-item array; `%photos[]%` displays nothing.
  Use the plural `photos` name, including for a single image.
- `link`: required `url`; optional `text`. Omitted `text` displays
  the URL. Supplied `text` is translated through `t`.
- `bold`: text directly after the semicolon, translated through `t` and rendered as `<strong>` using
  the theme’s `--font-weight-bold` token. Example: `%bold;Important%`.

Names are case-sensitive. The internal `Photos`, `Link` and `Bold` components render these
placeholders automatically, without a dictionary, JSX values or registrations.
The optional `renderers` map can override inline placeholders for an instance. A string containing
only one valid placeholder renders the component without surrounding quotes;
mixed text retains JSON-style quotes. Multiple placeholders work in one string.

Photo arrays support JSON double-quoted keys/strings, or the abbreviated syntax
shown above. Quote values containing commas, braces, brackets or quotes. Quoted
strings use JSON escapes. Percent signs, semicolons and equals signs can appear
normally inside photo strings:

```js
const data = {
  photos:
    '%photos[{"src":"/my%20portrait.jpg","alt":"Portrait; author"},{src:/other.jpg,alt:Second portrait}]%',
};
```

Only `src`, `alt` and `square` are accepted in each photo object. Other styling belongs to the
renderer, not placeholder data. Photo lists
are parsed as data, never executed as JavaScript. An invalid item leaves the
whole placeholder literal, rather than rendering a partial collection.

Link parameter values and bold text can contain spaces and equals signs. Escape their delimiter
characters with a backslash: `\;`, `\%` and `\\`. In JSON source that backslash is
doubled. For example, `"%link;url=example.com;text=Hello\\; world%"` displays
`Hello; world`.

Unknown names, missing required parameters, unsupported/duplicate parameters and
malformed placeholders remain literal text. Parameter strings are not recursively
parsed as placeholders. HTML stays escaped; it never becomes executable markup.
An unterminated photo list leaves the remaining text literal, including any
placeholder-like strings inside that list.

Placeholder processing applies to string values at every depth, including
values rendered through custom components' `render(data)` calls. It does not
process JSON keys, section titles, icon names or arbitrary component props.
Calculations such as elapsed years belong to the application; its translation
function can insert a computed number into `%years%` before returning the text. The core does no date arithmetic.

## Rendering components

`section`, `photos`, `link` and `bold` are built in. The data/sections interface and
inline placeholders require no renderer nodes in data or custom registrations.
There is no separate template renderer.
Advanced use can still embed explicit nodes:

```js
{
  renderer: "link",
  props: { url: "example.com" },
  value: "Website"
}
```

An object with its own string `renderer` property is a renderer node. `props` is
spread onto the selected component literally. Optional `value` is rendered
recursively and passed as `children`. A node without `value` has no children.
Components also receive raw `value`, `t`, `render(data)`; these are
reserved props supplied by the core after the node's `props`.

`renderers={{ section: CustomSection }}` overrides a built-in or registers a
custom component. Registrations are case-sensitive and local to the instance;
only own properties are used. An explicit `null` registration disables a built-in.
Unknown/disabled nodes render their `value` using the default rendering rules;
with no `value` they produce no content. Metadata in `props` is not displayed.
The same renderer map, translations and collapse settings apply recursively.

Built-in renderers:

- `section`: translated `title` (default `"Section"`), optional `icon`, and children.
  Used internally by the `sections` map as well as explicit nodes.
- `photos`: images from a `props.items` array, with translated `alt` (default empty).
  Each item supports `square` (default `true`); `false` preserves its native aspect ratio.
  A renderer-level `className` applies to all images; it is not an item field.
  An inline flex wrapper adds a 6px gap between images and wraps them onto new rows when needed.
  Standalone photo values appear below their attribute name and omit the trailing JSON comma; photo values in arrays
  are separated by a 6px gap.
- `link`: `url` with rendered children, or the URL itself when value is omitted.
  Email gets `mailto:`; explicit `mailto:` URLs (including query parameters) are
  preserved. Other addresses without HTTP(S) get `https://`.
  Web links use a new tab and `rel="noopener noreferrer"`. A missing URL renders
  only children.
- `bold`: rendered children wrapped in `<strong>`, using `--font-weight-bold`.
  Explicit nodes use `{ renderer: "bold", value: "Important" }`.

### External styling renderers

A custom renderer owns its styles and can reuse a built-in component:

```jsx
import { Photos } from "react-json-eye";

function MyPhotos(props) {
  return <Photos {...props} className="my-photos" />;
}

<JsonEye data={data} renderers={{ photos: MyPhotos }} />;
```

The data stays `%photos[{src:/portrait.jpg,alt:Portrait}]%`. `className` is not a
placeholder parameter for photos, links or bold text. Overrides receive the parsed props and
`t`; link and bold renderers also receive the translated label as `children` when supplied.
Only own registrations are used. Without an override, built-ins render normally.
A `null` override leaves an inline placeholder literal.

## Styling and collapse

Core styles are scoped and require no global stylesheet. Configure the document's
appearance through the optional `theme` prop: a flat object of CSS custom-property
names and values. Each instance merges known tokens with `defaultTheme` and sets
all resolved variables on its root element. Built-in styles read them using
`var(...)`. Omitted, `undefined` or `null` tokens keep their defaults. Unknown
tokens and nested objects are ignored. Inputs are never mutated.

```jsx
import JsonEye, { defaultTheme } from "react-json-eye";

const theme = {
  "--color-text": "#222",
  "--color-background": "#fff",
  "--color-accent": "#2563eb",
  "--font-family": "Arial, sans-serif",
  "--font-size": "16px",
  "--line-height": 1.5,
  "--heading-text-transform": "none",
  "--property-gap": "8px",
  "--section-gap": "32px",
  "--photo-width": "160px",
  "--icon-size": "36px",
  "--control-radius": "4px",
  "--icon-radius": "8px",
  "--print-font-size": "12px",
  "--print-property-gap": "2px",
};

<JsonEye data={data} theme={theme} />;
// Override just one token; all other values use the defaults.
<JsonEye data={data} theme={{ "--color-accent": "#e11d48" }} />;

// Inspect or reuse the complete set of default tokens.
console.log(defaultTheme);
```

Use CSS strings with units for lengths; font weights and line heights can be
numbers. Standard CSS values, including `var(--app-accent)` references to your
application's variables, work for style tokens.

The complete token names and default values are exported as `defaultTheme`
(see [src/defaultTheme.js](./src/defaultTheme.js)):

| Purpose | Tokens |
| --- | --- |
| Colors | `--color-text`, `--color-background` (controls and icon foreground), `--color-accent` |
| Typography | `--font-family`, `--font-size`, `--line-height`, `--heading-font-size`, `--heading-line-height`, `--heading-text-transform`, `--control-font-size` (toggle SVG size) |
| Font weights | `--font-weight-regular`, `--font-weight-bold`, `--font-weight-heading` |
| Spacing | `--photo-gap`, `--icon-padding`, `--property-gap`, `--control-gap`, `--control-margin`, `--focus-offset`, `--heading-gap`, `--heading-margin`, `--indent`, `--section-gap`, `--array-gap`, `--item-gap` |
| Value width | `--content-max-width` (default `"100%"`; limits individual values, inline array items and built-in links/photos at every nesting depth) |
| Sizes and radii | `--photo-width`, `--icon-size`, `--control-size`, `--control-radius`, `--icon-radius` |
| Borders and interaction | `--photo-border-width`, `--photo-border-style`, `--photo-border-color`, `--photo-border-radius`, `--border-width`, `--hover-accent-weight` (a percentage such as `"12%"`) |
| Print typography | `--print-font-size`, `--print-line-height`, `--print-heading-font-size`, `--print-heading-line-height` |
| Print sizing and spacing | `--print-icon-size`, `--print-icon-padding`, `--print-section-gap`, `--print-property-gap`, `--print-item-gap`, `--print-heading-margin` |

The value width is a wrapping limit, not a character-count or truncation limit.
For example, `"--content-max-width": "90ch"` wraps long values to that width
or the available parent width, whichever is smaller, including in print. Section
headings keep their full width. Custom renderers must constrain
their own content if they use fixed dimensions or disable wrapping.

Variables are inherited by nested JSON, built-in sections, links, photos and
built-ins reused inside custom renderers, including `render(data)` calls.
Standalone exports have CSS fallbacks when used outside `JsonEye`. Each nested
`JsonEye` sets its own theme and defaults, so it does not inherit another
instance's overrides. Print tokens apply only when printing.

Keep reusable theme objects outside components and use a new object when changing
tokens in React. `defaultTheme.js` contains only token definitions; merging logic
lives separately in `resolveTheme.js`.

The old `--json-*` names are no longer read. Move overrides into `theme` using
the flat names above: for example, `--json-color-accent` becomes
`"--color-accent"`, `--json-font-family` becomes `"--font-family"`, and
`--json-print-line-height` becomes `"--print-line-height"`. Use `"--array-gap"`
for `--json-array-gap`, `"--print-property-gap"` for `--json-property-gap`, and
both `"--item-gap"` and `"--print-item-gap"` for `--json-item-gap` if it should
affect screen and print.

`className` and Emotion's `css` prop remain available for application layout and
custom renderer styling. Section, link, bold and photos components also forward a
renderer-level `className`. Section backgrounds belong in application styles.
React and Emotion are required.

`DocumentSection` provides a heading with a unique accessible ID. Root and nested
containers start expanded; empty containers have no toggle. Content remains
mounted and visible when printing. Both photo variants use `width: 120px`, `max-width: 100%` and
`height: auto` to fit their container. By default, `aspect-ratio: 1 / 1` and
`object-fit: cover` crop them to squares; item-level `square: false` preserves
the native aspect ratio.
Page dimensions and global styles are controlled by the consuming application.
Use theme tokens for built-in photo sizes and borders. Photo borders are disabled
by default (`--photo-border-width: "0px"`), with `solid` style, `currentColor`
and a `0px` radius. Enable and customize them through `theme`:

```jsx
<JsonEye data={data} theme={{
  "--photo-border-width": "1px",
  "--photo-border-style": "solid",
  "--photo-border-color": "#ccc",
  "--photo-border-radius": "8px",
}} />;
```

Borders are included in the photo width (`box-sizing: border-box`). These tokens
apply to both square and native-ratio photos, including standalone `Photos`
with the same CSS variable fallbacks. Use a custom renderer for other decorations.

Standalone `JsonObject` supports `value`, `renderers`, `t`,
`collapsible`, `initiallyExpanded`, `expanded`, `onExpandedChange` and `label`.
Its optional boolean `expanded` controls the outer container;
`onExpandedChange(expanded)` reports requested changes. Omit `expanded` to use
internal state initialized by `initiallyExpanded`. `collapsible={false}` disables
all subtree toggles, including custom renderer children and explicit render calls.

## Translation helper

```jsx
import JsonEye, { createTranslator } from "react-json-eye";

const t = createTranslator("sk", {
  en: { name: "Name", greeting: "Hello" },
  sk: { name: "Meno", greeting: "Ahoj" },
});

<JsonEye data={{ name: "Jane", greeting: "greeting" }} t={t} />;
```

`createTranslator(language = "en", dictionaries = {})` looks up the selected
language, then English, then returns the original token. Dictionaries map exact
strings to translations. A custom `t` function can implement interpolation.

## Demo

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The demo imports the library directly from
`src/` and uses local SVG assets. Try English/Slovak content, section headings,
collapsible nested JSON, inline links, bold text and photos, a custom photo renderer, and
light/dark themes. Expand the input panel to inspect the data and section metadata.

```sh
npm run build:demo
```

The standalone static demo is built into `demo-dist/`, separately from the
library's `dist/`. Demo sources and output are excluded from the npm package.

## Checks

```sh
npm test
npm run lint
npm run build
```

Tests cover plain JSON, separate section metadata, inline placeholders, built-in and
custom renderers, local overrides, icon paths, translations,
collapse controls, escaping and links.

## Package development

Use Node.js `20.19+` or `22.12+` (as required by the build tools) and npm.

```sh
npm ci
npm run check
npm pack
```

`check` runs lint, rendering tests, the production build and a smoke test of the
public package exports, followed by the demo build. `npm pack` runs the same checks through `prepack` and
creates `react-json-eye-3.0.1.tgz`. See [PUBLISHING.md](./PUBLISHING.md) for release
verification and publishing commands, and [CHANGELOG.md](./CHANGELOG.md) for changes.

The ESM build is exported from `dist/json-eye.js`. React, React DOM and Emotion
remain external peer dependencies. Named exports are `JsonEye`, `JsonObject`,
`DocumentSection`, `CollapsibleContent`, `Photos`, `Link`, `Bold`, `Section`, `Icon`,
`createTranslator` and `defaultTheme`; the default export is `JsonEye`.

## License

[MIT](./LICENSE), copyright Mirozlav.
