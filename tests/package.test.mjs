import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import JsonEye, * as api from "react-json-eye";

test("built package exposes the documented public API without a JSX loader", () => {
  assert.deepEqual(Object.keys(api).sort(), [
    "CollapsibleContent", "DocumentSection", "Icon", "JsonEye", "JsonObject",
    "Link", "Photos", "Section", "createTranslator", "default", "defaultTheme",
  ].sort());
  assert.equal(JsonEye, api.JsonEye);
  for (const [key, value] of Object.entries(api)) {
    assert.equal(typeof value, key === "defaultTheme" ? "object" : "function");
  }
});

test("compiled package renders sections, placeholders and Emotion styles", () => {
  const t = api.createTranslator("sk", { sk: { profile: "Profil" } });
  const html = renderToStaticMarkup(createElement(JsonEye, {
    data: { profile: { website: "%link;url=example.com;text=Website%" } },
    sections: { profile: { title: "profile" } },
    t,
    theme: { "--color-accent": "#bada55", "--control-size": "30px" },
  }));
  assert.match(html, /<section\b/);
  assert.match(html, /Profil/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /Website<\/a>/);
  assert.match(html, /data-emotion=/);
  assert.doesNotMatch(html, /%link/);
  assert.match(html, /--color-accent:#bada55/);
  assert.match(html, /border:var\(--border-width, 2px\) solid var\(--color-accent, #49a1f7\)/);
  assert.match(html, /--control-size:30px/);
  assert.match(html, /width:var\(--control-size, 24px\);height:var\(--control-size, 24px\)/);
});
