import { el } from "./dom.js?v=105";
import { createBrand, createButton, createSocialLinks } from "./components.js?v=105";
import { openJoinModal } from "./join.js?v=105";
import { initReveal, initSpotlight, initTilt } from "./effects.js?v=105";
import { initRouter } from "./router.js?v=105";

const navItems = [
  { id: "home", label: "Home", href: "index.html" },
  { id: "profile", label: "Player Stats", href: "profile.html" },
  { id: "ranked", label: "Ranked", href: "ranked.html" },
  { id: "leaderboards", label: "Leaderboards", href: "leaderboards.html" },
];

let chrome = null;

function createChrome() {
  const links = el(
    "nav",
    { className: "navLinks", id: "navLinks", "aria-label": "Main navigation" },
    navItems.map((item) => el("a", { className: "navLink", href: item.href, "data-page": item.id }, item.label)),
  );

  const toggle = createButton({
    label: "☰",
    variant: "secondary",
    onClick: () => {
      const open = links.classList.toggle("isOpen");
      toggle.setAttribute("aria-expanded", String(open));
    },
  });
  toggle.classList.add("navToggle", "buttonIcon");
  toggle.setAttribute("aria-label", "Toggle navigation");
  toggle.setAttribute("aria-controls", "navLinks");
  toggle.setAttribute("aria-expanded", "false");

  const joinButton = createButton({ label: "Join", onClick: openJoinModal });
  joinButton.classList.add("navJoin");

  const header = el(
    "header",
    { className: "navbar" },
    el("div", { className: "container navbarInner" }, createBrand(), links, joinButton, toggle),
  );

  const footer = el(
    "footer",
    { className: "footer" },
    el("div", { className: "container footerInner" }, createBrand({ showSubtitle: false }), el("span", {}, `© ${new Date().getFullYear()} AVENMC`)),
  );

  document.body.prepend(header);
  document.body.append(footer);
  initSpotlight();
  initTilt();
  initRouter();
  requestAnimationFrame(initReveal);
  return { links, toggle };
}

// Builds the header and footer once. Later calls (client-side navigation) only update the active link.
export function renderLayout(activePage) {
  document.querySelector(".pageBackdrop")?.remove();
  chrome ??= createChrome();
  chrome.links.querySelectorAll(".navLink").forEach((link) => {
    const isActive = link.dataset.page === activePage;
    link.classList.toggle("isActive", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  chrome.links.classList.remove("isOpen");
  chrome.toggle.setAttribute("aria-expanded", "false");
  return document.getElementById("app");
}
