import { el } from "./dom.js";
import { createBrand, createButton } from "./components.js";

const navItems = [
  { id: "home", label: "Home", href: "index.html" },
  { id: "profile", label: "Player Stats", href: "profile.html" },
  { id: "leaderboards", label: "Leaderboards", href: "leaderboards.html" },
];

export function renderLayout(activePage) {
  const links = el(
    "nav",
    { className: "navLinks", id: "navLinks", "aria-label": "Main navigation" },
    navItems.map((item) =>
      el(
        "a",
        {
          className: `navLink${item.id === activePage ? " isActive" : ""}`,
          href: item.href,
          "aria-current": item.id === activePage ? "page" : null,
        },
        item.label,
      ),
    ),
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

  const header = el(
    "header",
    { className: "navbar" },
    el("div", { className: "container navbarInner" }, createBrand(), links, toggle),
  );

  const footer = el(
    "footer",
    { className: "footer" },
    el(
      "div",
      { className: "container footerInner" },
      createBrand({ showSubtitle: false }),
      el("span", {}, `© ${new Date().getFullYear()} AVENMC`),
      el("div", { className: "footerLinks" }, el("a", { href: "https://avenmc.net" }, "avenmc.net")),
    ),
  );

  const main = document.getElementById("app");
  document.body.prepend(header);
  document.body.append(footer);
  return main;
}
