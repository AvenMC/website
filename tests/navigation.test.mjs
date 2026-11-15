import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

function moduleSource(file, version) {
  return readFileSync(new URL(`../js/${file}`, import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replaceAll("import.meta.url", JSON.stringify(`https://example.com/js/${file}?v=${version}`))
    .replaceAll("export function", "function");
}

function routerEnvironment(destinationVersion) {
  const listeners = { document: {}, window: {} };
  const assignments = [];
  const errors = [];
  const main = {
    classList: { add() {}, remove() {} },
    addEventListener() {},
  };
  const location = {
    href: "https://example.com/index.html",
    origin: "https://example.com",
    pathname: "/index.html",
    search: "",
    assign: (url) => assignments.push(url),
  };
  const document = {
    addEventListener: (name, callback) => { listeners.document[name] = callback; },
    getElementById: () => main,
  };
  const context = {
    URL, Symbol, Map, Promise,
    document,
    location,
    console: { error: (...args) => errors.push(args) },
    window: { addEventListener: (name, callback) => { listeners.window[name] = callback; } },
    setTimeout: (callback) => callback(),
    fetch: async () => ({ ok: true, text: async () => "" }),
    DOMParser: class {
      parseFromString() {
        return {
          title: "Ranked",
          querySelector: (selector) => selector.startsWith("script")
            ? { getAttribute: () => `js/pages/ranked.js?v=${destinationVersion}` }
            : null,
        };
      }
    },
  };
  return { context, listeners, assignments, errors };
}

test("a new deployment reloads instead of importing a second layout version", async () => {
  const env = routerEnvironment("new");
  const router = runInNewContext(`${moduleSource("router.js", "old")}\n({ initRouter, navigate });`, env.context);
  router.initRouter();
  await router.navigate(new URL("https://example.com/ranked.html"), { push: true });
  assert.deepEqual(env.assignments, ["https://example.com/ranked.html"]);
  assert.equal(env.errors.length, 0);
});

test("router listeners are initialized only once across module versions", () => {
  const env = routerEnvironment("new");
  const first = runInNewContext(`${moduleSource("router.js", "old")}\ninitRouter;`, { ...env.context });
  first();
  const click = env.listeners.document.click;
  const popstate = env.listeners.window.popstate;
  const second = runInNewContext(`${moduleSource("router.js", "new")}\ninitRouter;`, { ...env.context });
  second();
  assert.equal(env.listeners.document.click, click);
  assert.equal(env.listeners.window.popstate, popstate);
});

test("failed navigation reports its error before loading the destination normally", async () => {
  const env = routerEnvironment("new");
  env.context.fetch = async () => { throw new Error("Network unavailable"); };
  const navigate = runInNewContext(`${moduleSource("router.js", "new")}\nnavigate;`, env.context);
  await navigate(new URL("https://example.com/ranked.html"), { push: true });
  assert.equal(env.errors.length, 1);
  assert.deepEqual(env.assignments, ["https://example.com/ranked.html"]);
});

test("layout module versions reuse existing header, footer and drawer controls", () => {
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
  for (const version of ["old", "new", "newer"]) {
    const renderLayout = runInNewContext(`${moduleSource("layout.js", version)}\nrenderLayout;`, { document, Symbol });
    assert.equal(renderLayout("ranked"), app);
  }
  assert.equal(closed, 3);
  assert.equal(expanded, "false");
  assert.deepEqual(active, { home: false, ranked: true });
});
