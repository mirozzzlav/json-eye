import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import JsonEye, * as api from "react-json-eye";

test("built package exposes the documented public API without a JSX loader", () => {
  assert.deepEqual(Object.keys(api).sort(), [
    "CollapsibleContent", "DocumentSection", "Icon", "JsonEye", "JsonObject",
    "Link", "Photos", "Section", "createTranslator", "default",
  ].sort());
  assert.equal(JsonEye, api.JsonEye);
  for (const value of Object.values(api)) assert.equal(typeof value, "function");
});

test("compiled package renders sections, placeholders and Emotion styles", () => {
  const t = api.createTranslator("sk", { sk: { profile: "Profil" } });
  const html = renderToStaticMarkup(createElement(JsonEye, {
    data: { profile: { website: "%link;url=example.com;text=Website%" } },
    sections: { profile: { title: "profile", background: "#abcdef" } },
    t,
  }));
  assert.match(html, /<section\b/);
  assert.match(html, /Profil/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /Website<\/a>/);
  assert.match(html, /data-emotion=/);
  assert.match(html, /#abcdef/);
  assert.doesNotMatch(html, /%link/);
});
