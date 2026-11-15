# JsonEye

React JSON document renderer. Package name: `react-json-eye`.

[Source code](https://github.com/mirozzzlav/json-eye) ·
[Issues](https://github.com/mirozzzlav/json-eye/issues)

Keep data in ordinary JSON and pass presentation separately. `sections` uses the
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
    background: "#f4f7fb",
  },
  skills: { title: "Skills", icon: "/icons/skills.svg" },
};

<JsonEye data={data} sections={sections} className="my-document" />;
```

Only `data` is required. `sections`, `expanded`, `onExpandedChange`, `t`,
`renderers` and `className` are optional. Pass parsed data, not JSON source text.

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
| `t` | Identity function | Translates keys, string values and renderer labels. |
| `renderers` | Built-in renderers | Instance-local component overrides or registrations. |
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
outer JSON container. Empty containers and primitive values have no toggle.
Nested objects and arrays start expanded and toggle independently; their toggles
do not trigger the section callback. All content stays visible in print.

Optional `background` styles the whole section, including its heading. Use a CSS
color such as `"#f4f7fb"`, a CSS background such as `"linear-gradient(...)"`, or an
image path/URL such as `"/images/pattern.svg"`. Image backgrounds cover the section,
are centered, and do not repeat. Omit `background` for no added background.
Background values are literal and are not translated or interpolated.

Background paths are supplied directly in `sections`, without a dictionary or
`backgrounds` prop:

```js
const sections = {
  aboutMe: {
    title: "About me",
    icon: "/icons/profile.svg",
    background: "/backgrounds/pattern.svg",
  },
};
```

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

Names are case-sensitive. The internal `Photos` and `Link` components render these
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

Link parameter values can contain spaces and equals signs. Escape their delimiter
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

`section`, `photos` and `link` are built in. The data/sections interface and
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
- `link`: `url` with rendered children, or the URL itself when value is omitted.
  Email gets `mailto:`; explicit `mailto:` URLs (including query parameters) are
  preserved. Other addresses without HTTP(S) get `https://`.
  Web links use a new tab and `rel="noopener noreferrer"`. A missing URL renders
  only children.

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
placeholder parameter for photos or links. Overrides receive the parsed props and
`t`; link renderers also receive the translated label as `children` when supplied.
Only own registrations are used. Without an override, built-ins render normally.
A `null` override leaves an inline placeholder literal.

## Styling and collapse

Core styles are scoped and require no global stylesheet.
Customize `--json-color-text`, `--json-color-background`, `--json-color-accent`
and `--json-font-family` on the document or an ancestor. `JsonEye` forwards
`className` and supports Emotion's `css` prop. React and Emotion are required.
Section, link and photos components forward a renderer-level `className`.

`DocumentSection` provides a heading with a unique accessible ID. Root and nested
containers start expanded; empty containers have no toggle. Content remains
mounted and visible when printing. Both photo variants use `width: 120px`, `max-width: 100%` and
`height: auto` to fit their container. By default, `aspect-ratio: 1 / 1` and
`object-fit: cover` crop them to squares; item-level `square: false` preserves
the native aspect ratio.
Page dimensions, global styles, custom photo sizes and decorations are controlled
by the consuming application.

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
collapsible nested JSON, inline links and photos, a custom photo renderer, and
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
creates `react-json-eye-2.0.0.tgz`. See [PUBLISHING.md](./PUBLISHING.md) for release
verification and publishing commands, and [CHANGELOG.md](./CHANGELOG.md) for changes.

The ESM build is exported from `dist/json-eye.js`. React, React DOM and Emotion
remain external peer dependencies. Named exports are `JsonEye`, `JsonObject`,
`DocumentSection`, `CollapsibleContent`, `Photos`, `Link`, `Section`, `Icon` and
`createTranslator`; the default export is `JsonEye`.

## License

[MIT](./LICENSE), copyright Mirozlav.
