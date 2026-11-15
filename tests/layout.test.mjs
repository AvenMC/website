import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../js/layout.js", import.meta.url), "utf8");

test("page links use native navigation without intercepting clicks or mixing modules", () => {
  assert.doesNotMatch(source, /initRouter|preventDefault|import\(/);
  for (const page of ["index", "profile", "ranked", "leaderboards"]) {
    assert.ok(source.includes(`href: "${page}.html"`));
  }
});

test("repeated layout modules reuse header, footer and drawer controls", () => {
  let closed = 0;
  let expanded;
  const active = {};
  const links = ["home", "ranked"].map((id) => ({
    dataset: { page: id },
    classList: { toggle: (_, value) => { active[id] = value; } },
    setAttribute() {},
    removeAttribute() {},
  }));
  const chrome = {
    links: {
      querySelectorAll: () => links,
      classList: { remove: () => { closed += 1; } },
    },
    toggle: { setAttribute: (_, value) => { expanded = value; } },
  };
  const app = {};
  const document = {
    [Symbol.for("avenmc.chrome")]: chrome,
    querySelector: () => null,
    getElementById: () => app,
  };
  const script = source.replace(/^import .*;\n/gm, "").replaceAll("export function", "function");
  for (let index = 0; index < 3; index += 1) {
    const renderLayout = runInNewContext(`${script}\nrenderLayout;`, { document, Symbol });
    assert.equal(renderLayout("ranked"), app);
  }
  assert.equal(closed, 3);
  assert.equal(expanded, "false");
  assert.deepEqual(active, { home: false, ranked: true });
});
