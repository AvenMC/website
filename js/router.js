import { initReveal } from "./effects.js?v=71";

// Client-side navigation: swaps the page content and keeps header and footer in place.
// Every page is its own module that renders into #app when it runs, so a fresh import re-renders it.
const leaveMs = 140;
let navigationId = 0;
const pageCache = new Map();

function isInternalPageLink(anchor, event) {
  if (!anchor || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith(".html")) return false;
  return !(url.pathname === location.pathname && url.search === location.search);
}

async function loadPage(url) {
  const key = url.pathname;
  if (!pageCache.has(key)) {
    pageCache.set(
      key,
      fetch(url.pathname)
        .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.status))))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const script = doc.querySelector('script[type="module"][src*="pages/"]');
          if (!script) throw new Error("not a routed page");
          return { title: doc.title, description: doc.querySelector('meta[name="description"]')?.content, module: new URL(script.getAttribute("src"), url).href };
        }),
    );
  }
  return pageCache.get(key);
}

async function navigate(url, { push }) {
  const id = ++navigationId;
  const main = document.getElementById("app");
  main.classList.remove("isEntering");
  main.classList.add("isLeaving");
  try {
    const [page] = await Promise.all([loadPage(url), new Promise((resolve) => setTimeout(resolve, leaveMs))]);
    if (id !== navigationId) return;
    if (push) history.pushState(null, "", url);
    document.title = page.title;
    if (page.description) document.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
    window.scrollTo({ top: 0, behavior: "instant" });
    // A unique query string makes the browser run the page module again.
    await import(`${page.module}&nav=${id}`);
    if (id !== navigationId) return;
    main.classList.remove("isLeaving");
    main.classList.add("isEntering");
    initReveal();
  } catch {
    location.href = url.href;
  }
}

export function initRouter() {
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!isInternalPageLink(anchor, event)) return;
    event.preventDefault();
    navigate(new URL(anchor.href, location.href), { push: true });
  });
  window.addEventListener("popstate", () => navigate(new URL(location.href), { push: false }));
  document.getElementById("app").addEventListener("animationend", (event) => {
    if (event.target === event.currentTarget) event.currentTarget.classList.remove("isEntering");
  });
}
