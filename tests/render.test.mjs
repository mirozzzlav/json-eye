import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: "custom",
});
after(() => server.close());
const { default: JsonEye } = await server.ssrLoadModule("/src/JsonEye.jsx");
const { default: JsonObject } = await server.ssrLoadModule(
  "/src/JsonObject.jsx",
);
const { default: CollapsibleContent } = await server.ssrLoadModule(
  "/src/CollapsibleContent.jsx",
);
const render = (data, props = {}) =>
  renderToStaticMarkup(createElement(JsonEye, { data, ...props }));
const withoutStyles = (html) =>
  html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "");
const text = (html) =>
  withoutStyles(html)
    .replace(/<[^>]*>/g, "")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'");

test("plain root objects render as JSON without automatic sections or headings", () => {
  const html = render({
    name: "aboutTitle",
    projects: [
      { title: "Shop", technologies: ["React", "Python"], published: true },
    ],
    languages: { slovak: "native" },
    missing: null,
  });
  assert.doesNotMatch(html, /<section\b|<h3\b/);
  assert.equal(
    text(html),
    '{"name": "aboutTitle","projects": [{"title": "Shop","technologies": ["React", "Python"],"published": true}],"languages": {"slovak": "native"},"missing": null}',
  );
  assert.doesNotMatch(html, /<img\b/);
});

test("section metadata decorates clean JSON in data order without changing it", () => {
  const data = { aboutMe: { name: "Jane" }, skills: ["React"] };
  const sections = {
    skills: { title: "Skills" },
    aboutMe: { title: "profileTitle", icon: "/icons/profile.svg" },
    missing: { title: "Not shown" },
  };
  const original = JSON.stringify({ data, sections });
  const html = render(data, {
    sections,
    t: (token) => (token === "profileTitle" ? "Profile" : token),
  });
  assert.equal((html.match(/<section\b/g) ?? []).length, 2);
  assert.equal(text(html), 'Profile{"name": "Jane"}Skills["React"]');
  assert.doesNotMatch(text(html), /"aboutMe":|"skills":|Not shown/);
  assert.equal(JSON.stringify({ data, sections }), original);
  assert.equal(
    text(render(data)),
    '{"aboutMe": {"name": "Jane"},"skills": ["React"]}',
  );
});

test("section metadata has safe defaults and applies only at the document root", () => {
  const data = { first: { nested: { title: "Literal", value: 3 } }, empty: {} };
  const sections = Object.create({ first: { title: "Inherited" } });
  assert.equal(
    text(render(data, { sections })),
    'Section{"nested": {"title": "Literal","value": 3}}Section{}',
  );
  assert.equal(text(render({}, { sections })), "");
  assert.equal(text(render([1, 2], { sections })), "[1, 2]");
  assert.equal(text(render(false, { sections })), "false");
  assert.equal(text(render(undefined, { sections })), "");
  const withoutUndefined = render(
    { first: undefined, last: null },
    { sections: { last: { title: "Last" } } },
  );
  assert.equal(text(withoutUndefined), "Lastnull");
  assert.equal((withoutUndefined.match(/<section\b/g) ?? []).length, 1);
});

test("inline placeholders render internal photos and links after translation at every depth", () => {
  const photo = "%photos[{src:/portrait.jpg,alt:portrait}]%";
  const link = "%link;url=example.com;text=website%";
  const t = (token) =>
    ({
      portrait: "Portrét osoby",
      website: "Website",
      messageToken: `Hello ${link} ${link}`,
    })[token] ?? token;
  const html = render(
    { profile: { message: "messageToken", items: [photo, link] } },
    {
      sections: { profile: { title: "Profile" } },
      t,
    },
  );
  assert.equal((html.match(/<a\b/g) ?? []).length, 3);
  assert.match(html, /<img[^>]*src="\/portrait.jpg"[^>]*alt="Portrét osoby"/);
  assert.ok(text(html).includes('"Hello Website Website"'));
  assert.equal(text(render(photo, { t })), "");
  assert.equal(text(render(link, { t })), "Website");
  assert.equal(
    text(render("100% complete. " + photo, { t })),
    '"100% complete. "',
  );
});

test("bold placeholders translate labels, mix with text and links, and use theme weight", () => {
  const token = "%bold;important%";
  const t = (value) => ({ important: "Dôležité", message: `Read ${token} %link;url=example.com%` })[value] ?? value;
  const html = render({ nested: ["message", token] }, { t, theme: { "--font-weight-bold": 800 } });
  assert.match(html, /<strong[^>]*>Dôležité<\/strong>/);
  assert.match(html, /font-weight:var\(--font-weight-bold, 700\)/);
  assert.match(html, /--font-weight-bold:800/);
  assert.ok(text(html).includes('"Read Dôležité example.com"'));
  assert.equal(text(render(token, { t })), "Dôležité");
  assert.equal(text(render("%bold;%")), "");
  assert.doesNotMatch(render(["%bold;Short%"]), /<br\b/);
  assert.match(render([`%bold;${"a".repeat(31)}%`]), /<br\b/);
});

test("bold supports explicit nodes, standalone exports and local overrides", async () => {
  const { Bold } = await server.ssrLoadModule("/src/index.js");
  assert.match(renderToStaticMarkup(createElement(Bold, { className: "emphasis" }, "Label")), /<strong[^>]*class="emphasis[^\"]*">Label<\/strong>/);
  assert.equal(text(render({ renderer: "bold", value: "Label" })), '"Label"');
  const token = "%bold;Label%";
  const renderers = { bold: ({ children }) => createElement("b", null, children) };
  assert.match(render(token, { renderers }), /<b>Label<\/b>/);
  assert.match(render(token, { renderers: Object.create(renderers) }), /<strong\b/);
  assert.equal(text(render(token, { renderers: { bold: null } })), JSON.stringify(token));
  assert.match(render(token), /<strong\b/);
});

test("bold escapes delimiters and HTML and preserves invalid placeholders", () => {
  assert.equal(text(render("%bold;Hello\\; 100\\% \\\\ done=ok%")), "Hello; 100% \\ done=ok");
  assert.equal(text(render("%bold;value=ok%")), "value=ok");
  assert.equal(text(render("%bold; two words %")), " two words ");
  const html = render("%bold;<script>alert(1)</script>%");
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  for (const token of ["%bold%", "%bold;x;y%", "%bold;x;className=y%", "%bold;x", "%Bold;text=x%"]) {
    assert.equal(text(render(token)), JSON.stringify(token));
  }
  assert.doesNotMatch(render("%bold;label%", { t: (value) => value === "label" ? "%link;url=example.com%" : value }), /<a\b/);
});

test("inline placeholders propagate into render calls without changing keys or props", () => {
  function Panel({ render, details, title }) {
    return createElement("aside", { title }, render(details));
  }
  const token = "%photos[{src:/portrait.jpg}]%";
  const html = render(
    { renderer: "panel", props: { title: token, details: { [token]: token } } },
    {
      renderers: { panel: Panel },
    },
  );
  assert.ok(html.includes(`title="${token}"`));
  assert.match(html, /<img[^>]*src="\/portrait.jpg"/);
  assert.equal(text(html), `{"${token}": }`);
});

test("plain JSON preserves value and metadata-like fields at every depth", () => {
  assert.equal(
    text(render({ value: 42, unit: "kg" })),
    '{"value": 42,"unit": "kg"}',
  );
  const value = {
    value: "%link% %years%",
    hidden: true,
    omitComma: true,
    title: "Literal",
    url: "example.com",
  };
  const expected =
    '{"value": "%link% %years%","hidden": true,"omitComma": true,"title": "Literal","url": "example.com"}';
  const object = renderToStaticMarkup(createElement(JsonObject, { value }));
  assert.equal(text(object), expected);
  const document = render({
    item: value,
    array: [value, { value: false }],
    last: null,
  });
  assert.equal(
    text(document),
    `{"item": ${expected},"array": [${expected},{"value": false}],"last": null}`,
  );
  assert.doesNotMatch(document, /<a\b|<img\b/);
});

test("root arrays, primitives, null and empty containers render", () => {
  for (const value of [
    null,
    false,
    true,
    0,
    42,
    "hello",
    [],
    [1, null, { nested: [false] }],
  ]) {
    const html = render(value);
    const nested = renderToStaticMarkup(createElement(JsonObject, { value }));
    assert.equal(text(html), text(nested));
    assert.doesNotMatch(html, /<section\b|<h3\b/);
  }
  assert.equal(text(render(false)), "false");
  assert.equal(text(render([])), "[]");
  assert.equal(text(render({})), '{}');
  assert.equal(text(render({ empty: {} })), '{"empty": {}}');
});

test("sections are reusable with arbitrary children and unique accessible headings", async () => {
  const { default: DocumentSection } = await server.ssrLoadModule(
    "/src/DocumentSection.jsx",
  );
  const html = renderToStaticMarkup(
    createElement(
      "main",
      null,
      createElement(JsonEye, {
        data: {
          renderer: "section",
          props: { title: "First" },
          value: { first: 1 },
        },
      }),
      createElement(JsonEye, {
        data: {
          renderer: "section",
          props: { title: "Second" },
          value: { second: 2 },
        },
      }),
      createElement(
        DocumentSection,
        { title: "Custom" },
        createElement("p", null, "Content"),
      ),
    ),
  );
  const ids = [...html.matchAll(/<h3 id="([^"]+)"/g)].map((match) => match[1]);
  const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(ids.length, 3);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(labels, ids);
  assert.ok(html.includes("<p>Content</p>"));
});

test("independent translators have useful defaults and fallbacks", async () => {
  const { createTranslator } = await server.ssrLoadModule("/src/i18n.js");
  const t = createTranslator("sk", {
    sk: { greeting: "Ahoj", empty: "" },
    en: { greeting: "Hello", fallback: "English" },
  });
  assert.equal(t("greeting"), "Ahoj");
  assert.equal(t("fallback"), "English");
  assert.equal(t("empty"), "");
  assert.equal(t("constructor"), "constructor");
  assert.equal(
    createTranslator("de", { en: { greeting: "Hello" } })("greeting"),
    "Hello",
  );
});

test("collapsible content supports arbitrary children and accessible controls", () => {
  for (const initiallyExpanded of [false, true]) {
    const html = renderToStaticMarkup(
      createElement(
        CollapsibleContent,
        { label: "Details", initiallyExpanded },
        createElement("em", null, "Content"),
      ),
    );
    const controls = html.match(/aria-controls="([^"]+)"/)[1];
    assert.ok(html.includes(`id="${controls}"`));
    assert.ok(html.includes(`aria-expanded="${initiallyExpanded}"`));
    assert.ok(html.includes("<em>Content</em>"));
    assert.match(html, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.match(html, /<path d="M6 12h12"/);
    assert.equal(html.includes('d="M12 6v12"'), !initiallyExpanded);
    assert.equal(html.includes("@media screen"), !initiallyExpanded);
  }
});

test("registered components receive props, raw value and recursively rendered children", () => {
  function Box({ heading, value, children }) {
    assert.deepEqual(value, { count: 2, flag: false });
    return createElement("article", { "data-heading": heading }, children);
  }
  const html = render(
    {
      renderer: "box",
      props: { heading: "Custom" },
      value: { count: 2, flag: false },
    },
    { renderers: { box: Box } },
  );
  assert.match(html, /<article data-heading="Custom">/);
  assert.equal(text(html), '{"count": 2,"flag": false}');
  assert.doesNotMatch(html, /<section\b|<h3\b/);
});

test("renderers work at every depth and nodes without value do not acquire children", () => {
  function Badge({ text, children }) {
    assert.equal(children, undefined);
    return createElement("em", null, text);
  }
  function Frame({ children }) {
    return createElement("aside", null, children);
  }
  const html = render(
    {
      renderer: "frame",
      value: {
        items: [
          { renderer: "badge", props: { text: "Hi" } },
          { nested: { renderer: "frame", value: [1, true, null] } },
        ],
      },
    },
    { renderers: { badge: Badge, frame: Frame } },
  );
  assert.equal(text(html), '{"items": [Hi,{"nested": [1, true, null]}]}');
  assert.equal((html.match(/<aside\b/g) ?? []).length, 2);
  assert.match(html, /<em>Hi<\/em>/);
});

test("props are literal; render explicitly handles nodes in props with the same registry", () => {
  const icon = { renderer: "star" };
  function Heading({ icon: passedIcon, title, render, t, children }) {
    assert.deepEqual(passedIcon, icon);
    return createElement(
      "header",
      null,
      render(passedIcon),
      t(title),
      children,
    );
  }
  function Star() {
    return createElement("b", null, "★");
  }
  const html = render(
    {
      renderer: "heading",
      props: { title: "titleToken", icon },
      value: "body",
    },
    {
      renderers: { heading: Heading, star: Star },
      t: (token) => (token === "titleToken" ? "Title" : token),
    },
  );
  assert.equal(text(html), '★Title"body"');
});

test("unknown renderer names fall back to value, including falsy and missing values", () => {
  for (const value of [false, 0, "", null, [], { value: 2 }]) {
    const html = render({
      renderer: "missing",
      props: { title: "Not shown" },
      value,
    });
    const object = renderToStaticMarkup(createElement(JsonObject, { value }));
    assert.equal(text(html), text(object));
    assert.doesNotMatch(html, /Not shown|missing/);
  }
  assert.equal(text(render({ renderer: "missing" })), "");
  for (const renderer of ["constructor", "toString", "__proto__"]) {
    assert.equal(text(render({ renderer, value: 3 })), "3");
  }
});

test("renderer dictionaries are isolated and only own registrations are used", () => {
  const data = { renderer: "marker", value: "normal" };
  function Marker() {
    return createElement("b", null, "Custom");
  }
  assert.equal(text(render(data, { renderers: { marker: Marker } })), "Custom");
  assert.equal(text(render(data)), '"normal"');
  assert.equal(
    text(render(data, { renderers: Object.create({ marker: Marker }) })),
    '"normal"',
  );
  assert.equal(
    text(render({ renderer: 42, value: 1 })),
    "{\"renderer\": 42,\"value\": 1}",
  );
});

test("built-in photos and link render without registration at the root and nested in JSON", () => {
  const photo = {
    renderer: "photos",
    props: {
      items: [{ src: "/portrait.jpg", alt: "portrait" }],
      className: "portrait",
    },
  };
  const t = (token) => (token === "portrait" ? "Portrét" : token);
  for (const data of [photo, { profile: { items: [photo] } }]) {
    const html = render(data, { t });
    assert.match(
      html,
      /<img[^>]*src="\/portrait.jpg"[^>]*alt="Portrét"[^>]*class="portrait(?: [^"]*)?"/,
    );
    assert.doesNotMatch(html, /170px|230px/);
  }
  const html = render(
    {
      renderer: "link",
      props: { url: "example.com" },
      value: photo,
    },
    { t },
  );
  assert.match(
    withoutStyles(html),
    /<a[^>]*href="https:\/\/example.com"[^>]*><span[^>]*><img/,
  );
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test("built-in links handle web URLs, email, omitted labels and missing URLs", () => {
  for (const [url, href] of [
    ["example.com", "https://example.com"],
    ["http://example.com", "http://example.com"],
    ["https://example.com", "https://example.com"],
    ["hello@example.com", "mailto:hello@example.com"],
  ]) {
    const html = render({ renderer: "link", props: { url } });
    assert.match(html, new RegExp(`href="${href}"`));
    assert.equal(text(html), url);
    assert.equal(html.includes('target="_blank"'), !href.startsWith("mailto:"));
  }
  assert.equal(text(render({ renderer: "link", value: "Label" })), '"Label"');
});

test("built-ins support local overrides, explicit render calls and standalone JsonObject", () => {
  const photo = {
    renderer: "photos",
    props: { items: [{ src: "/portrait.jpg" }] },
  };
  function CustomPhoto() {
    return createElement("b", null, "Custom photo");
  }
  function Frame({ render, image }) {
    return createElement("aside", null, render(image));
  }
  const frame = { renderer: "frame", props: { image: photo } };
  assert.match(
    withoutStyles(render(frame, { renderers: { frame: Frame } })),
    /<aside><span[^>]*><img/,
  );
  assert.equal(
    text(
      render(frame, {
        renderers: { frame: Frame, photos: CustomPhoto },
      }),
    ),
    "Custom photo",
  );
  assert.match(render(photo), /<img/);
  assert.match(
    render(photo, { renderers: Object.create({ photos: CustomPhoto }) }),
    /<img/,
  );
  assert.equal(
    text(
      render(
        { ...photo, value: "Fallback" },
        {
          renderers: { photos: null },
        },
      ),
    ),
    '"Fallback"',
  );
  const html = renderToStaticMarkup(
    createElement(JsonObject, {
      value: { renderer: "link", props: { url: "example.com" }, value: photo },
    }),
  );
  assert.match(withoutStyles(html), /<a[^>]*><span[^>]*><img/);
});

test("built-in sections translate titles and render nested content and application icons", () => {
  const section = {
    renderer: "section",
    props: {
      title: "profileTitle",
      icon: "/icons/star.svg",
      className: "profile",
    },
    value: {
      name: "Jane",
      website: { renderer: "link", props: { url: "example.com" } },
      details: {
        renderer: "section",
        props: { title: "Details" },
        value: { active: true },
      },
    },
  };
  const html = render(section, {
    t: (token) => (token === "profileTitle" ? "Profile" : token),
  });
  assert.equal((html.match(/<section\b/g) ?? []).length, 2);
  assert.match(html, /class="profile /);
  assert.ok(text(html).startsWith('Profile{"name": "Jane","website": example.com'));
  assert.match(html, /href="https:\/\/example.com"/);
  const ids = [...html.matchAll(/<h3 id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, 2);
  for (const id of ids) assert.ok(html.includes(`aria-labelledby="${id}"`));
  assert.doesNotMatch(
    render(section, { renderers: { section: null } }),
    /<section\b/,
  );
});

test("section icons accept image paths and can be omitted without renderer nodes", () => {
  for (const icon of [
    "/icons/profile.svg",
    "./profile.png",
    "profile.webp",
    "https://example.com/icon.svg",
  ]) {
    const html = render({
      renderer: "section",
      props: { icon },
      value: { name: "Jane" },
    });
    assert.ok(html.includes(`src="${icon}"`));
    assert.match(html, /<img[^>]*alt=""[^>]*aria-hidden="true"/);
    assert.ok(text(html).startsWith("Section"));
  }
  for (const icon of [undefined, null, "", "  ", false, 42, {}]) {
    const html = render({ renderer: "section", props: { icon }, value: {} });
    assert.doesNotMatch(html, /<img\b|<svg\b/);
    assert.equal(text(html), "Section{}");
  }
});

test("icon paths work in nested values and explicit render calls without an icon map", () => {
  function Frame({ render, details }) {
    return createElement("aside", null, render(details));
  }
  const section = {
    renderer: "section",
    props: { title: "Title", icon: "/icons/star.svg" },
    value: {},
  };
  for (const data of [
    section,
    { nested: [section] },
    { renderer: "frame", props: { details: section } },
  ]) {
    const html = render(data, { renderers: { frame: Frame } });
    assert.match(html, /<img[^>]*src="\/icons\/star.svg"/);
  }
  const standalone = renderToStaticMarkup(
    createElement(JsonObject, { value: section }),
  );
  assert.match(standalone, /<img[^>]*src="\/icons\/star.svg"/);
});

test("built-in sections compose icons, photos and links without renderer overrides", () => {
  const html = render({
    profile: {
      renderer: "section",
      props: {
        title: "Profile",
        icon: "/icons/about-me.svg",
      },
      value: {
        photo: {
          renderer: "photos",
          props: { items: [{ src: "/jan.jpg", alt: "Portrait" }] },
        },
        web: {
          renderer: "link",
          props: { url: "example.com" },
          value: "example.com",
        },
      },
    },
  });
  assert.equal((html.match(/<section\b/g) ?? []).length, 1);
  assert.equal((html.match(/<img\b/g) ?? []).length, 2);
  assert.match(html, /<img[^>]*src="\/jan.jpg"[^>]*alt="Portrait"/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.equal(text(html), '{"profile": Profile{"photo": "web": "example.com"}}');
  const basic = render({
    renderer: "section",
    props: { title: "Profile" },
    value: { name: "Jane" },
  });
  assert.equal(text(basic), 'Profile{"name": "Jane"}');
  assert.equal((basic.match(/<section\b/g) ?? []).length, 1);
  assert.doesNotMatch(basic, /background-image:url\(|<img\b/);
});

test("email renderer keeps contact arrays inline and opens a mail client", () => {
  const html = render({
    contact: [
      "+421 911 595 643",
      {
        renderer: "link",
        props: { url: "mirofurinda@proton.me" },
        value: "mirofurinda@proton.me",
      },
    ],
  });
  assert.match(html, /href="mailto:mirofurinda@proton.me"/);
  assert.doesNotMatch(html, /target="_blank"|<br\b/);
  assert.equal(
    text(html),
    '{"contact": ["+421 911 595 643", "mirofurinda@proton.me"]}',
  );
});

test("inline parameters support spaces, escaped delimiters, and equals signs in URLs", () => {
  const html = render(
    String.raw`%photos[{"src":"/my%20portrait.jpg","alt":"Semi; percent% slash\\ text"}]%`,
  );
  assert.match(html, /src="\/my%20portrait.jpg"/);
  assert.match(html, /alt="Semi; percent% slash\\ text"/);
  const link = render(
    "%link;url=https://example.com/?a=1&b=2;text=My website%",
  );
  assert.ok(link.includes('href="https://example.com/?a=1&amp;b=2"'));
  assert.equal(text(link), "My website");
});

test("photos accepts multiple descriptors, quoted strings and an empty collection", () => {
  const example =
    "%photos[{src:xxx, alt:something}, {src:yyy, alt:something1}]%";
  const html = render(example);
  assert.equal((html.match(/<img\b/g) ?? []).length, 2);
  assert.match(html, /src="xxx" alt="something"/);
  assert.match(html, /src="yyy" alt="something1"/);
  assert.equal(text(html), "");
  const mixed = render(
    'Before %photos[{"src":"/one, two.jpg","alt":"A } ] % ; quote: \\""},{src:/other.jpg}]% after',
  );
  assert.equal((mixed.match(/<img\b/g) ?? []).length, 2);
  assert.match(mixed, /src="\/one, two.jpg"/);
  assert.equal(text(mixed), '"Before  after"');
  assert.equal(text(render("%photos[]%")), "");
});

test("photo values omit trailing commas while keeping spacing between images", () => {
  const token = "%photos[{src:/one.jpg},{src:/two.jpg}]%";
  const node = {
    renderer: "photos",
    props: { items: [{ src: "/one.jpg" }, { src: "/two.jpg" }] },
  };
  for (const photo of [token, node]) {
    const objectHtml = render({ photo, next: true });
    assert.equal(text(objectHtml), '{"photo": "next": true}');
    assert.match(withoutStyles(objectHtml), /&quot;photo&quot;<\/span>: <br\/>(?:<span[^>]*>)?<span[^>]*data-json-photos/);
    const html = render([photo, photo, true]);
    assert.equal(text(html), "[true]");
    assert.equal((html.match(/<img\b/g) ?? []).length, 4);
    assert.match(html, /gap:var\(--photo-gap, 6px\)/);
    assert.match(html, /margin-right:var\(--photo-gap, 6px\)/);
  }
  assert.equal(
    text(render({ photo: "translated", next: true }, {
      t: (value) => value === "translated" ? token : value,
    })),
    "{\"photo\": \"next\": true}",
  );
  for (const photo of ["%photos[{src:null}]%", `Before ${token}`]) {
    assert.match(text(render({ photo, next: true })), /","next": true}/);
  }
  assert.equal(
    text(render([token, true], { renderers: { photos: null } })),
    `[${JSON.stringify(token)}, true]`,
  );
});

test("single photos render below the attribute with translations and renderer overrides", () => {
  const token = "%photos[{src:/portrait.jpg}]%";
  function CustomPhotos() {
    return createElement("img", { src: "/custom.jpg", alt: "Custom" });
  }
  for (const renderers of [undefined, { photos: CustomPhotos }]) {
    const html = render({ photo: "portrait" }, {
      t: (value) => value === "portrait" ? token : value,
      renderers,
    });
    assert.match(withoutStyles(html), /&quot;photo&quot;<\/span>: <br\/>/);
    assert.equal((html.match(/<img\b/g) ?? []).length, 1);
  }
  for (const photo of [`Before ${token}`, "%photos[{src:null}]%"]) {
    assert.doesNotMatch(render({ photo }), /<br\b/);
  }
  assert.doesNotMatch(render({ photo: token }, { renderers: { photos: null } }), /<br\b/);
});

test("photos default to square cover and allow each item to preserve its native ratio", () => {
  for (const square of [undefined, true, false]) {
    const item = { src: "/landscape.jpg", alt: "Landscape" };
    if (square !== undefined) item.square = square;
    for (const data of [
      `%photos[${JSON.stringify(item)}]%`,
      { renderer: "photos", props: { items: [item] } },
    ]) {
      const html = render(data);
      assert.match(html, /<img[^>]*src="\/landscape.jpg"[^>]*alt="Landscape"/);
      assert.match(html, /max-width:100%;height:auto/);
      assert.doesNotMatch(withoutStyles(html), /\bsquare=/);
      if (square === false) {
        assert.doesNotMatch(html, /aspect-ratio:|object-fit:cover/);
      } else {
        assert.match(html, /aspect-ratio:1\s*\/\s*1;object-fit:cover/);
      }
    }
  }
  const html = render(
    "%photos[{src:/square.jpg,square:true},{src:/native.jpg,square:false}]%",
  );
  const images = [...html.matchAll(/<img[^>]*class="([^"]*)"/g)];
  assert.equal(images.length, 2);
  assert.notEqual(images[0][1], images[1][1]);
});

test("photo borders default to zero and use theme tokens for both aspect ratios and standalone exports", async () => {
  const { Photos, defaultTheme } = await server.ssrLoadModule("/src/index.js");
  assert.equal(defaultTheme["--photo-border-width"], "0px");
  assert.equal(defaultTheme["--photo-border-style"], "solid");
  assert.equal(defaultTheme["--photo-border-color"], "currentColor");
  assert.equal(defaultTheme["--photo-border-radius"], "0px");
  for (const square of [true, false]) {
    const items = [{ src: "/photo.jpg", square }];
    const theme = {
      "--photo-border-width": "2px",
      "--photo-border-style": "dashed",
      "--photo-border-color": "#123456",
      "--photo-border-radius": "8px",
    };
    const html = render({ renderer: "photos", props: { items } }, { theme });
    for (const [name, value] of Object.entries(theme)) {
      assert.ok(html.includes(`${name}:${value}`));
    }
    const standalone = renderToStaticMarkup(createElement(Photos, { items }));
    for (const output of [html, standalone]) {
      assert.match(output, /box-sizing:border-box/);
      assert.match(output, /border-width:var\(--photo-border-width, 0px\)/);
      assert.match(output, /border-style:var\(--photo-border-style, solid\)/);
      assert.match(output, /border-color:var\(--photo-border-color, currentColor\)/);
      assert.match(output, /border-radius:var\(--photo-border-radius, 0px\)/);
    }
  }
});

test("unknown or malformed placeholders stay literal and text never becomes HTML", () => {
  for (const value of [
    "%unknown;src=/photo.jpg%",
    "%photo%",
    "%link%",
    "%yearsSince:2011%",
    "%photo;alt=Portrait%",
    "%photo;src=%",
    "%photo;src=x;src=y%",
    "%photo;src=x;onError=alert(1)%",
    "%photo;src=x;__proto__=bad%",
    "%photo;src=x;alt%",
    "%photo;src=x",
    "%constructor;src=x%",
    "%photos[{alt:Portrait}]%",
    "%photos[{src:x,src:y}]%",
    "%photos[{src:x,onError:alert(1)}]%",
    "%photos[{src:x,className:custom}]%",
    "%link;url=example.com;className=custom%",
    "%photos[{src:null}]%",
    "%photos[{src:x,alt:123}]%",
    '%photos[{src:x,square:"false"}]%',
    "%photos[{src:x,square:0}]%",
    "%photos[{src:x,square:null}]%",
    "%photos[{src:x,square:true,square:false}]%",
    "%photos[{src:x},{src:y,square:invalid}]%",
    "%photos[{src:{nested:x}}]%",
    "%photos[{src:x},null]%",
    '%photos[{"src":"unterminated}]%',
    "%photos[{src:x}]",
  ]) {
    const html = render(value);
    assert.equal(text(html), JSON.stringify(value));
    assert.doesNotMatch(html, /<img\b|<a\b/);
  }
  const html = render("<script> %link;url=example.com;text=<b>Label</b>%");
  assert.doesNotMatch(html, /<script>|<b>/);
  assert.ok(text(html).includes("&lt;script&gt; &lt;b&gt;Label&lt;/b&gt;"));
});

test("external placeholder renderers own their styles while JSON stays presentation-free", async () => {
  const { default: Photos } = await server.ssrLoadModule(
    "/src/renderers/Photos.jsx",
  );
  function StyledPhotos(props) {
    return createElement(Photos, { ...props, className: "custom-photos" });
  }
  function StyledLink({ url, children }) {
    return createElement(
      "a",
      { href: url, className: "custom-link" },
      children,
    );
  }
  const data = {
    images: "%photos[{src:/one.jpg,alt:portrait},{src:/two.jpg}]%",
    web: "%link;url=https://example.com;text=Website%",
  };
  const original = JSON.stringify(data);
  const html = render(data, {
    renderers: { photos: StyledPhotos, link: StyledLink },
    t: (token) => (token === "portrait" ? "Portrét" : token),
  });
  assert.equal(
    (html.match(/class="custom-photos(?: [^"]*)?"/g) ?? []).length,
    2,
  );
  assert.match(html, /alt="Portrét"/);
  assert.match(html, /class="custom-link">Website<\/a>/);
  assert.equal(JSON.stringify(data), original);
  assert.doesNotMatch(render(data), /custom-photos|custom-link/);
  assert.doesNotMatch(
    render(data, { renderers: Object.create({ photos: StyledPhotos }) }),
    /custom-photos/,
  );
  const token = "%photos[{src:/one.jpg}]%";
  assert.equal(
    text(render(token, { renderers: { photos: null } })),
    JSON.stringify(token),
  );
});

test("inline email links use internal defaults and layout follows displayed text", () => {
  const email = "%link;url=hello@example.com%";
  const html = render({ contact: ["Phone", email] });
  assert.match(html, /href="mailto:hello@example.com"/);
  assert.doesNotMatch(html, /target="_blank"|<br\b|Override/);
  const long = render(["%link;url=example.com;text=" + "a".repeat(31) + "%"]);
  assert.match(long, /<br\b/);
});

test("undefined entries are filtered and data-like props are not interpreted as metadata", () => {
  assert.equal(text(render(undefined)), "");
  assert.equal(
    text(
      render({
        omitted: undefined,
        shown: { real: 2, missing: undefined },
        $: false,
      }),
    ),
    "{\"shown\": {\"real\": 2},\"$\": false}",
  );
  assert.equal(
    text(render({ item: { value: 1, hidden: true } })),
    "{\"item\": {\"value\": 1,\"hidden\": true}}",
  );
});

test("disabling collapse also reaches renderer children and explicit render calls", () => {
  function Frame({ children, render, details }) {
    return createElement("div", null, children, render(details));
  }
  const html = renderToStaticMarkup(
    createElement(JsonObject, {
      value: {
        renderer: "frame",
        props: { details: { extra: [3] } },
        value: { nested: { renderer: "frame", value: [1, { child: 2 }] } },
      },
      renderers: { frame: Frame },
      collapsible: false,
    }),
  );
  assert.equal(text(html), '{"nested": [1,{"child": 2}]}{"extra": [3]}');
  assert.doesNotMatch(html, /<button\b|display:none/);
});

test("root objects and explicit section contents start expanded without automatic sections", () => {
  const html = render({
    first: {
      renderer: "section",
      props: { title: "First" },
      value: { nested: ["First"] },
    },
    second: {
      renderer: "section",
      props: { title: "Second" },
      value: [{ nested: ["Second"] }],
    },
    empty: {},
  });
  assert.deepEqual(
    [...html.matchAll(/<button\b[^>]*aria-expanded="([^"]+)"/g)].map(
      (match) => match[1],
    ),
    ["true", "true", "true", "true", "true", "true", "true", "true"],
  );
  const empty = renderToStaticMarkup(createElement(JsonObject, { value: {} }));
  assert.equal(text(empty), '{}');
  assert.doesNotMatch(empty, /<button\b|display:none/);
});

test("initial expansion applies only to the outer container, including custom render calls", () => {
  function Frame({ children, render, details }) {
    return createElement("aside", null, children, render(details));
  }
  for (const initiallyExpanded of [false, true]) {
    const html = renderToStaticMarkup(
      createElement(JsonObject, {
        value: {
          list: [{ child: [1] }],
          custom: {
            renderer: "frame",
            props: { details: { extra: [2] } },
            value: { nested: [3] },
          },
        },
        renderers: { frame: Frame },
        initiallyExpanded,
      }),
    );
    const states = [
      ...html.matchAll(/<button\b[^>]*aria-expanded="([^"]+)"/g),
    ].map((match) => match[1]);
    assert.equal(states.length, 8);
    assert.equal(states[0], String(initiallyExpanded));
    assert.ok(states.slice(1).every((state) => state === "true"));
  }
});

test("disabled inline renderers use literal text when deciding array layout", () => {
  for (const token of [
    "%photos[{src:/a-very-long-photo-filename.jpg}]%",
    "%link;url=example.com;text=Short%",
  ]) {
    const name = token.startsWith("%photos") ? "photos" : "link";
    assert.doesNotMatch(render([token]), /<br\b/);
    const html = render([token], { renderers: { [name]: null } });
    assert.equal(text(html), `[${JSON.stringify(token)}]`);
    assert.match(html, /<br\b/);
  }
});

test("web URLs containing credentials or query emails stay web links", () => {
  for (const url of [
    "https://user@example.com",
    "http://user@example.com",
    "https://example.com/?email=user@example.com",
    "  https://example.com  ",
  ]) {
    for (const value of [
      { renderer: "link", props: { url } },
      `%link;url=${url}%`,
    ]) {
      const html = render(value);
      assert.ok(html.includes(`href="${url.trim()}"`));
      assert.match(html, /target="_blank"/);
      assert.doesNotMatch(html, /mailto:/);
    }
  }
  const html = render({
    renderer: "link",
    props: { url: "   " },
    value: "Label",
  });
  assert.equal(text(html), '"Label"');
  assert.doesNotMatch(html, /<a\b/);
});

test("expanded map controls each section independently of nested containers", () => {
  const data = { closed: { nested: [1] }, open: { nested: [2] }, default: [3] };
  const sections = {
    closed: { title: "Closed" },
    open: { title: "Open" },
  };
  const expanded = { closed: false, open: true };
  const snapshot = JSON.stringify({ data, sections, expanded });
  const html = render(data, { sections, expanded });
  const states = [
    ...html.matchAll(/<button\b[^>]*aria-expanded="([^"]+)"/g),
  ].map((match) => match[1]);
  assert.deepEqual(states, ["false", "false", "true", "true", "true", "true", "true", "true"]);
  assert.ok(text(html).includes('Closed{"nested": [1]}'));
  assert.equal(JSON.stringify({ data, sections, expanded }), snapshot);
  const defaults = render(
    { missing: [1], invalid: [2], empty: {} },
    {
      sections: {
        missing: null,
        invalid: {},
        empty: {},
      },
      expanded: { invalid: "false", empty: false },
    },
  );
  assert.deepEqual(
    [...defaults.matchAll(/<button\b[^>]*aria-expanded="([^"]+)"/g)].map(
      (match) => match[1],
    ),
    ["true", "true", "true", "true"],
  );
});

test("section expansion ignores legacy metadata and inherited map properties", () => {
  const data = { details: [1], other: [2] };
  const sections = { details: { expanded: false } };
  for (const expanded of [undefined, null, {}, Object.create({ details: false })]) {
    const html = render(data, { sections, expanded });
    assert.deepEqual(
      [...html.matchAll(/<button\b[^>]*aria-expanded="([^"]+)"/g)].map(
        (match) => match[1],
      ),
      ["true", "true", "true", "true"],
    );
  }
  const plain = render(data, { expanded: { details: false, other: false } });
  assert.doesNotMatch(plain, /aria-expanded="false"/);
});

test("unterminated photo placeholders do not interpret embedded placeholders", () => {
  for (const value of [
    '%photos[{src:x,alt:%link;url=example.com;text=Nested%}',
    '%photos[{src:x,alt:"%link;url=example.com%"}]',
  ]) {
    const html = render(value);
    assert.equal(text(html), JSON.stringify(value));
    assert.doesNotMatch(html, /<a\b|<img\b/);
  }
});

test("explicit mailto links preserve their scheme and email options", () => {
  const url = "mailto:hello@example.com?subject=Hello";
  for (const value of [
    { renderer: "link", props: { url } },
    `%link;url=${url}%`,
  ]) {
    const html = render(value);
    assert.ok(html.includes(`href="${url}"`));
    assert.doesNotMatch(html, /target="_blank"|https:\/\/mailto:/);
  }
});

test("partial themes reach nested built-ins, custom render calls and print styles", async () => {
  const { Photos } = await server.ssrLoadModule("/src/index.js");
  function FramedPhotos(props) {
    return createElement(Photos, { ...props, className: "framed" });
  }
  function Panel({ render, details }) {
    return createElement("aside", null, render(details));
  }
  const theme = {
    "--color-text": "#123456",
    "--color-accent": "#654321",
    "--color-background": "#fedcba",
    "--font-family": "Arial, sans-serif",
    "--font-size": "17px",
    "--heading-text-transform": "none",
    "--indent": "29px",
    "--photo-gap": "11px",
    "--photo-width": "155px",
    "--photo-border-width": "3px",
    "--photo-border-style": "dashed",
    "--photo-border-color": "#abcdef",
    "--photo-border-radius": "7px",
    "--content-max-width": "70ch",
    "--icon-size": "44px",
    "--control-size": "28px",
    "--control-radius": "5px",
    "--icon-radius": "9px",
    "--border-width": "1px",
    "--hover-accent-weight": "20%",
    "--print-font-size": "13px",
    "--print-icon-size": "26px",
    "--print-property-gap": "2px",
  };
  const snapshot = JSON.stringify(theme);
  const html = render({
    profile: {
      nested: [{
        renderer: "panel",
        props: {
          details: {
            photo: "%photos[{src:/portrait.jpg}]%",
            web: "%link;url=example.com%",
          },
        },
      }],
    },
  }, {
    theme,
    sections: { profile: { title: "Profile", icon: "/profile.svg" } },
    renderers: { panel: Panel, photos: FramedPhotos },
  });
  for (const [name, value] of Object.entries(theme)) {
    assert.ok(html.replaceAll(" ", "").includes(`${name}:${value};`.replaceAll(" ", "")), `Root variable ${name}`);
  }
  assert.match(html, /max-width:min\(100%, var\(--content-max-width, 100%\)\)/);
  assert.match(html, /--line-height:22px/);
  assert.match(html, /--print-line-height:18px/);
  assert.match(html, /font-family:var\(--font-family,/);
  assert.doesNotMatch(html, /font-family:inherit/);
  assert.match(html, /font-size:var\(--font-size, 18px\);line-height:var\(--line-height, 22px\)/);
  assert.match(html, /font-size:var\(--print-font-size, 14px\);line-height:var\(--print-line-height, 18px\)/);
  assert.match(html, /text-transform:var\(--heading-text-transform, uppercase\)/);
  assert.match(html, /color:var\(--color-text, #000000\)/);
  assert.match(html, /margin-left:var\(--indent, 24px\)/);
  assert.match(html, /gap:var\(--photo-gap, 6px\)/);
  assert.match(html, /width:var\(--photo-width, 120px\);max-width:100%;height:auto/);
  assert.match(html, /width:var\(--icon-size, 40px\);height:var\(--icon-size, 40px\)/);
  assert.match(html, /width:var\(--print-icon-size, 32px\);height:var\(--print-icon-size, 32px\)/);
  assert.match(html, /border:var\(--border-width, 2px\) solid var\(--color-accent, #49a1f7\)/);
  assert.match(html, /color-mix\(in srgb, var\(--color-accent, #49a1f7\) var\(--hover-accent-weight, 12%\), var\(--color-background, #ffffff\)\)/);
  assert.match(html, /@media print\{[^}]*margin-bottom:var\(--print-property-gap, 3px\)/);
  assert.match(html, /class="framed /);
  assert.equal(JSON.stringify(theme), snapshot);
  assert.match(render({ normal: true }), /--color-accent:#49a1f7/);
});

test("sibling and nested JsonEye themes remain isolated", () => {
  function NestedDocument() {
    return createElement(JsonEye, { data: { child: true }, className: "child" });
  }
  const html = renderToStaticMarkup(createElement("main", null,
    createElement(JsonEye, {
      data: { renderer: "nested" },
      className: "parent",
      theme: { "--color-accent": "#aa1122" },
      renderers: { nested: NestedDocument },
    }),
    createElement(JsonEye, {
      data: { sibling: true },
      className: "sibling",
      theme: { "--color-accent": "#3344bb" },
    }),
  ));
  for (const [label, accent] of [["parent", "#aa1122"], ["child", "#49a1f7"], ["sibling", "#3344bb"]]) {
    const className = html.match(new RegExp(`class="${label} ([^"]+)"`))?.[1];
    assert.ok(className, `Root class for ${label}`);
    const ruleStart = html.indexOf(`.${className}{`);
    assert.ok(ruleStart >= 0);
    const rule = html.slice(ruleStart, html.indexOf("}", ruleStart));
    assert.ok(rule.includes(`--color-accent:${accent};`), `Scoped accent for ${label}`);
  }
  assert.equal(text(html), '{"child": true}{"sibling": true}');
});

test("theme merging preserves defaults and ignores unknown or invalid tokens", async () => {
  const { defaultTheme } = await server.ssrLoadModule("/src/defaultTheme.js");
  const { resolveTheme } = await server.ssrLoadModule("/src/resolveTheme.js");
  const snapshot = JSON.stringify(defaultTheme);
  const overrides = Object.assign(Object.create({ "--color-accent": "red" }), {
    "--color-text": "#456789",
    "--font-size": null,
    "--line-height": 1.5,
    "--property-gap": 0,
    "--indent": undefined,
    "--font-weight-bold": NaN,
    "--photo-width": {},
    "--unknown": "ignored",
    colors: { accent: "red" },
  });
  const theme = resolveTheme(overrides);
  assert.equal(theme["--color-text"], "#456789");
  assert.equal(theme["--color-accent"], defaultTheme["--color-accent"]);
  assert.equal(theme["--font-size"], "18px");
  assert.equal(theme["--line-height"], 1.5);
  const html = render({ x: 1 }, { theme: overrides });
  assert.match(html, /--line-height:1\.5;/);
  assert.match(html, /--property-gap:0;/);
  assert.doesNotMatch(html, /--unknown:/);
  assert.equal(theme["--property-gap"], 0);
  assert.equal(theme["--indent"], "24px");
  assert.equal(theme["--font-weight-bold"], 700);
  assert.equal(theme["--photo-width"], "120px");
  assert.deepEqual(Object.keys(theme), Object.keys(defaultTheme));
  assert.equal(JSON.stringify(defaultTheme), snapshot);
  assert.equal(render({ x: 1 }, { theme: null }), render({ x: 1 }, { theme: {} }));
});


test("section headings expose the root expansion state and accessible content target", () => {
  for (const expanded of [true, false]) {
    const html = withoutStyles(render(
      { details: { nested: [1] } },
      { sections: { details: { title: "Details" } }, expanded: { details: expanded } },
    ));
    const heading = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
    assert.match(heading, new RegExp(`aria-expanded="${expanded}"`));
    assert.match(heading, />Details<\/button>/);
    const target = heading.match(/aria-controls="([^"]+)"/)[1];
    assert.ok(html.includes(`<div id="${target}"`));
    assert.deepEqual(
      [...html.matchAll(/aria-expanded="([^"]+)"/g)].map((match) => match[1]),
      [String(expanded), String(expanded), "true"],
    );
  }
});

test("empty and primitive section headings stay static and disabled collapse is respected", () => {
  const html = withoutStyles(render(
    { empty: {}, list: [], missing: { value: undefined }, primitive: 1 },
    { sections: {} },
  ));
  assert.doesNotMatch(html, /<button/);
  const disabled = renderToStaticMarkup(createElement(JsonObject, {
    value: { renderer: "section", props: { title: "Details" }, value: { nested: [1] } },
    collapsible: false,
  }));
  assert.doesNotMatch(disabled, /<button/);
});


test("sectionRef binds data keys and reaches custom section renderers without changing metadata", () => {
  const data = { projects: [], aboutMe: {}, omitted: undefined };
  const sections = { projects: { title: "Projects" }, missing: {} };
  const original = JSON.stringify(sections);
  const refs = new Map();
  const calls = [];
  const sectionRef = (key, element) => calls.push([key, element]);
  function CustomSection({ value, elementRef }) {
    refs.set(value === data.projects ? "projects" : "aboutMe", elementRef);
    return createElement("section", { ref: elementRef });
  }
  render(data, { sections, sectionRef, renderers: { section: CustomSection } });
  assert.deepEqual([...refs.keys()], ["projects", "aboutMe"]);
  assert.deepEqual(calls, []);
  for (const [key, ref] of refs) {
    const element = { nodeName: "SECTION" };
    assert.equal(ref(element), undefined);
    assert.equal(ref(null), undefined);
    assert.deepEqual(calls.splice(0), [[key, element], [key, null]]);
  }
  assert.equal(JSON.stringify(sections), original);
});

test("sectionRef preserves built-in markup and does not run during server rendering", () => {
  const data = { projects: [{ name: "Example" }], aboutMe: "Bio" };
  const sections = { projects: { title: "Projects" } };
  const sectionRef = () => assert.fail("Server rendering must not attach refs");
  assert.equal(
    render(data, { sections, sectionRef }),
    render(data, { sections }),
  );
  assert.equal(render(data, { sectionRef }), render(data));
});


test("value width wraps root values and nested object/array values without sections", () => {
  const data = { description: "Long translated text", nested: { values: ["x".repeat(200), 123, null] } };
  const theme = { "--content-max-width": "24ch" };
  for (const props of [{ theme }, { theme, sections: { description: {}, nested: {} } }]) {
    const html = render(data, props);
    assert.match(html, /--content-max-width:24ch/);
    assert.match(html, /max-width:min\(100%, var\(--content-max-width, 100%\)\)/);
    const markup = withoutStyles(html);
    for (const value of ["Long translated text", "x".repeat(200), "123", "null"]) {
      assert.match(markup, new RegExp(`<span class="[^"]+">(?:&quot;)?${value}(?:&quot;)?(?:, ?)?</span>`));
    }
    assert.match(markup, /&quot;x+&quot;, <\/span>/);
    assert.equal(text(html).includes('"' + "x".repeat(200) + '", 123, null'), true);
  }
  assert.match(withoutStyles(render("x".repeat(200), { theme })), /<span class="[^"]+">&quot;x+&quot;<\/span>/);
});

test("attribute names are quoted and escaped after translation at every depth", () => {
  const key = 'Name "quoted"\\path\nline';
  const data = { name: "Jane", nested: { name: 1 }, items: [{ name: true }] };
  const output = text(render(data, { t: (token) => token === "name" ? key : token }));
  assert.deepEqual(JSON.parse(output), {
    [key]: "Jane",
    nested: { [key]: 1 },
    items: [{ [key]: true }],
  });
});
