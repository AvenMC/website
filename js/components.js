import { countries } from "./countries.js?v=66";
import { el } from "./dom.js?v=66";
import { siteConfig } from "./siteConfig.js?v=66";

export function createBrand({ showSubtitle = true } = {}) {
  return el(
    "a",
    { className: "brand", href: "index.html", "aria-label": "AVENMC Practice Network" },
    el("img", { className: "brandLogo", src: "assets/logoMark.png", alt: "", width: "40", height: "40" }),
    el(
      "span",
      { className: "brandText" },
      el("span", { className: "brandName" }, "AVEN", el("span", { className: "brandAccent" }, "MC")),
      showSubtitle && el("span", { className: "brandSubtitle" }, "PRACTICE NETWORK"),
    ),
  );
}

export function createButton({ label, variant = "primary", href, onClick, type = "button", icon }) {
  const className = `button button${capitalize(variant)}`;
  const children = [icon, label];
  if (href) return el("a", { className, href }, children);
  return el("button", { className, type, onClick }, children);
}

export function createCard({ title, text, highlighted = false, href, children = [] }) {
  const tag = href ? "a" : "div";
  return el(
    tag,
    { className: `card${highlighted ? " isHighlighted" : ""}`, href },
    title && el("h3", { className: "cardTitle" }, title),
    text && el("p", { className: "cardText" }, text),
    children,
  );
}

export function createSectionHeading({ eyebrow, title, description, level = "h2" }) {
  return el(
    "div",
    { className: "sectionHeading" },
    eyebrow && el("span", { className: "sectionEyebrow" }, eyebrow),
    el(level, {}, title),
    description && el("p", { className: "sectionDescription" }, description),
  );
}

export function createBadge({ label, variant = "default" }) {
  const variantClass = variant === "default" ? "" : ` badge${capitalize(variant)}`;
  return el("span", { className: `badge${variantClass}` }, label);
}

export function createAvatar({ username, skinUrl = null, size = "default" }) {
  const className = `avatar${size === "large" ? " avatarLarge" : ""}`;
  const wrapper = el("span", { className, "aria-hidden": "true" });
  const showLetter = () => wrapper.replaceChildren(username.charAt(0).toUpperCase());
  const image = el("img", {
    src: skinUrl ?? siteConfig.playerHeadUrl(username, size === "large" ? 128 : 64),
    alt: "",
    loading: "lazy",
    referrerpolicy: "no-referrer",
  });
  image.addEventListener("error", showLetter);
  wrapper.append(image);
  return wrapper;
}

export function createFlag(code, { size = "medium" } = {}) {
  const country = countries.find((item) => item.code === code) ?? { code: "unknown", name: "No country selected" };
  return el("img", {
    className: `flag flag${size === "large" ? "Large" : "Medium"}`,
    src: `assets/flags/${country.code}.svg`,
    alt: country.name,
    title: country.name,
    width: size === "large" ? "28" : "20",
    height: size === "large" ? "21" : "15",
    loading: "lazy",
  });
}

export function createPlayerName(username, { tag = "span", country = null, flagSize = "medium" } = {}) {
  return el(tag, { className: "playerLabel" }, createFlag(country, { size: flagSize }), el("span", { className: "playerName" }, username));
}

export function createRankBadge(rank) {
  return createBadge({ label: rank, variant: rank === "Member" ? "default" : "primary" });
}

export function createRankedBadge(tier) {
  return el("span", { className: `tierBadge${tier.key === "mythic" ? " isMythic" : ""}`, style: `--tierColor:${tier.color}` }, tier.name);
}

export function createStatCard({ label, value, hint, icon, accent = false }) {
  return el(
    "div",
    { className: "statCard" },
    el(
      "span",
      { className: "statLabel" },
      icon && el("span", { className: "statIcon", "aria-hidden": "true", style: `--iconUrl:url(../assets/icons/${icon}.svg)` }),
      label,
    ),
    el("span", { className: `statValue${accent ? " isAccent" : ""}` }, value),
    hint && el("span", { className: "statHint" }, hint),
  );
}

export function createTable({ columns, rows, caption, rowClass }) {
  const head = el(
    "tr",
    {},
    columns.map((column) => el("th", { scope: "col", className: cellClass(column) }, column.label)),
  );
  const body = rows.map((row, index) =>
    el(
      "tr",
      { className: rowClass ? rowClass(row, index) : null },
      columns.map((column) =>
        el(
          "td",
          { className: cellClass(column) },
          column.render ? column.render(row, index) : row[column.key],
        ),
      ),
    ),
  );

  return el(
    "div",
    { className: "tableWrap" },
    el(
      "table",
      { className: "table" },
      caption && el("caption", { className: "srOnly" }, caption),
      el("thead", {}, head),
      el("tbody", {}, body),
    ),
  );
}

export function createTabs({ tabs, active, label, onChange }) {
  const container = el("div", { className: "tabs", role: "tablist", "aria-label": label });

  function select(id) {
    container.querySelectorAll(".tab").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.id === id));
      tab.tabIndex = tab.dataset.id === id ? 0 : -1;
    });
    onChange(id);
  }

  tabs.forEach((tab) => {
    container.append(
      el(
        "button",
        {
          className: "tab",
          type: "button",
          role: "tab",
          "data-id": tab.id,
          "aria-selected": String(tab.id === active),
          tabindex: tab.id === active ? "0" : "-1",
          onClick: () => select(tab.id),
        },
        tab.label,
      ),
    );
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const items = [...container.querySelectorAll(".tab")];
    const current = items.findIndex((item) => item.getAttribute("aria-selected") === "true");
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = items[(current + step + items.length) % items.length];
    next.focus();
    select(next.dataset.id);
  });

  return container;
}

export function createDropdown({ label, options, value, onChange }) {
  let current = value;
  const labelFor = (optionValue) => options.find((option) => option.value === optionValue)?.label;
  const text = el("span", {}, labelFor(current));
  const trigger = el(
    "button",
    {
      className: "button buttonSecondary dropdownTrigger",
      type: "button",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      "aria-label": label,
    },
    text,
    el("span", { "aria-hidden": "true" }, "▾"),
  );
  const menu = el("ul", { className: "dropdownMenu", role: "listbox", hidden: true, "aria-label": label });
  const container = el("div", { className: "dropdown" }, trigger, menu);

  function setOpen(open) {
    menu.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  }

  function renderOptions() {
    menu.replaceChildren(
      ...options.map((option) =>
        el(
          "li",
          {
            className: "dropdownOption",
            role: "option",
            tabindex: "0",
            "aria-selected": String(option.value === current),
            onClick: () => choose(option.value),
            onKeydown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose(option.value);
              }
            },
          },
          option.label,
          option.hint && el("span", { className: "mutedText" }, option.hint),
        ),
      ),
    );
  }

  function choose(optionValue) {
    current = optionValue;
    text.textContent = labelFor(current);
    renderOptions();
    setOpen(false);
    trigger.focus();
    onChange(current);
  }

  trigger.addEventListener("click", () => setOpen(menu.hidden));
  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) setOpen(false);
  });
  container.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      trigger.focus();
    }
  });

  renderOptions();
  return container;
}

export function createSkeleton({ height = 16, width = "100%", circle = false, delay = 0 } = {}) {
  return el("span", {
    className: `skeleton${circle ? " isCircle" : ""}`,
    style: `--skeletonHeight:${height}px;--skeletonDelay:${delay}ms;width:${circle ? `${height}px` : width}`,
    "aria-hidden": "true",
  });
}

// Mimics a leaderboard/player row: rank, avatar, name and metric.
export function createSkeletonRow({ delay = 0 } = {}) {
  return el(
    "div",
    { className: "skeletonRow", "aria-hidden": "true" },
    createSkeleton({ height: 14, width: "22px", delay }),
    createSkeleton({ height: 36, circle: true, delay }),
    el("div", { className: "skeletonLines" }, createSkeleton({ height: 12, width: "40%", delay }), createSkeleton({ height: 10, width: "22%", delay })),
    createSkeleton({ height: 14, width: "56px", delay }),
  );
}

export function createSkeletonRows(count, { delayStep = 70 } = {}) {
  return el("div", { className: "skeletonList", role: "status", "aria-label": "Loading" }, Array.from({ length: count }, (_, i) => createSkeletonRow({ delay: i * delayStep })));
}

export function createEmptyState({ title, text }) {
  return el("div", { className: "emptyState" }, el("h3", {}, title), text && el("p", {}, text));
}

export function createModal({ title, body, actions }) {
  const dialog = el("dialog", { className: "modal", "aria-label": title });
  const close = () => dialog.close();

  dialog.append(
    el(
      "div",
      { className: "modalHeader" },
      el("h3", {}, title),
      el("button", { className: "button buttonSecondary buttonIcon", type: "button", "aria-label": "Close", onClick: close }, "✕"),
    ),
    el("div", { className: "modalBody" }, body),
    el("div", { className: "modalActions" }, actions?.(close) ?? createButton({ label: "Close", variant: "secondary", onClick: close })),
  );

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.body.append(dialog);

  return { open: () => dialog.showModal(), close };
}

export function withTooltip(node, text) {
  node.setAttribute("data-tooltip", text);
  if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "0");
  return node;
}

let toastTimer;

export function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = el("div", { id: "toast", className: "toast", role: "status", "aria-live": "polite" });
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add("isVisible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("isVisible"), 2400);
}

export function createSocialIcon(id) {
  return el("span", { className: "socialIcon", style: `--iconUrl:url(../assets/icons/${id}.svg)`, "aria-hidden": "true" });
}

export function createSocialLinks({ compact = false } = {}) {
  return siteConfig.socials.map((social) =>
    el(
      "a",
      {
        className: compact ? "socialLink isCompact" : "socialLink hasSpotlight",
        href: social.url,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${social.label} ${social.handle}`,
        "data-social": social.id,
      },
      createSocialIcon(social.id),
      !compact && el("span", { className: "socialText" }, el("strong", {}, social.label), el("span", {}, social.handle)),
    ),
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cellClass({ align, hideOnMobile }) {
  const classes = [];
  if (align === "right") classes.push("alignRight");
  if (align === "center") classes.push("alignCenter");
  if (hideOnMobile) classes.push("hideMobile");
  return classes.join(" ") || null;
}

export function createPagination({ page, pageCount, total, pageSize, offset = 0, onChange }) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (number) => number === 1 || number === pageCount || Math.abs(number - page) <= 1,
  );
  const items = [];
  pages.forEach((number, index) => {
    if (index > 0 && number - pages[index - 1] > 1) items.push(el("span", { className: "paginationGap" }, "…"));
    items.push(
      el(
        "button",
        { className: "pageButton", type: "button", "aria-current": number === page ? "page" : "false", "aria-label": `Page ${number}`, onClick: () => onChange(number) },
        String(number),
      ),
    );
  });

  return el(
    "nav",
    { className: "pagination", "aria-label": "Pagination" },
    el("span", { className: "paginationInfo" }, `${from + offset}–${to + offset} of ${total + offset}`),
    el(
      "div",
      { className: "paginationControls" },
      el("button", { className: "pageButton", type: "button", disabled: page === 1, "aria-label": "Previous page", onClick: () => onChange(page - 1) }, "‹"),
      items,
      el("button", { className: "pageButton", type: "button", disabled: page === pageCount, "aria-label": "Next page", onClick: () => onChange(page + 1) }, "›"),
    ),
  );
}
