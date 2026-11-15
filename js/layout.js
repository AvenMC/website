import { el } from "./dom.js?v=124";
import { createBrand, createButton, createSocialLinks } from "./components.js?v=124";
import { openJoinModal } from "./join.js?v=124";
import { initReveal, initSpotlight, initTilt } from "./effects.js?v=124";

const navItems = [
  { id: "home", label: "Home", href: "index.html", icon: "home" },
  { id: "profile", label: "Player Stats", href: "profile.html", icon: "player" },
  { id: "ranked", label: "Ranked", href: "ranked.html", icon: "sword" },
  { id: "leaderboards", label: "Leaderboards", href: "leaderboards.html", icon: "trophy" },
];

const chromeKey = Symbol.for("avenmc.chrome");

const navIcon = (icon) => el("span", {
  className: "navIcon",
  "aria-hidden": "true",
  style: `--iconUrl:url("${new URL(`../assets/icons/${icon}.svg`, import.meta.url).href}")`,
});

function createChrome() {
  const links = el(
    "nav",
    { className: "navLinks", id: "navLinks", "aria-label": "Main navigation" },
    navItems.map((item) => el("a", { className: "navLink", href: item.href, "data-page": item.id }, navIcon(item.icon), item.label)),
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
  joinButton.prepend(navIcon("gamepad"));
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
  requestAnimationFrame(initReveal);
  return { links, toggle };
}

// Reuse the same chrome if a page renders its layout more than once.
export function renderLayout(activePage) {
  document.querySelector(".pageBackdrop")?.remove();
  const chrome = document[chromeKey] ??= createChrome();
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
