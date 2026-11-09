import { el, replaceContent } from "../dom.js";
import { createBadge, createSectionHeading, createSkeleton, createTabs } from "../components.js";
import { gamemodes, getRankDistribution } from "../mockData.js";
import { rankTiers } from "../ranks.js";
import { formatNumber } from "../format.js";

const donutRadius = 70;
const circumference = 2 * Math.PI * donutRadius;
const svgNs = "http://www.w3.org/2000/svg";

function svg(tag, attributes = {}) {
  const node = document.createElementNS(svgNs, tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function animateNumber(node, target, duration = 900) {
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    node.textContent = formatNumber(Math.round(target * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function createDonut(data, onHover) {
  const chart = svg("svg", { viewBox: "0 0 180 180", class: "rankDonut", role: "img", "aria-label": "Rank distribution" });
  chart.append(svg("circle", { cx: 90, cy: 90, r: donutRadius, class: "rankDonutTrack" }));

  let offset = 0;
  rankTiers.forEach((tier) => {
    const share = data.counts[tier.key] / data.total;
    // Tiny tiers still need a visible arc.
    const length = Math.max(share * circumference, 3);
    const arc = svg("circle", {
      cx: 90,
      cy: 90,
      r: donutRadius,
      class: "rankDonutArc",
      "data-tier": tier.key,
      stroke: tier.color,
      "stroke-dasharray": `0 ${circumference}`,
      "stroke-dashoffset": -offset,
    });
    arc.addEventListener("mouseenter", () => onHover(tier.key));
    arc.addEventListener("mouseleave", () => onHover(null));
    chart.append(arc);
    requestAnimationFrame(() => requestAnimationFrame(() => arc.setAttribute("stroke-dasharray", `${length - 2} ${circumference - length + 2}`)));
    offset += share * circumference;
  });
  return chart;
}

function renderDistribution(data) {
  const maxCount = Math.max(...Object.values(data.counts));
  const totalNode = el("strong", {}, "0");
  const rows = rankTiers
    .slice()
    .reverse()
    .map((tier) =>
      el(
        "div",
        { className: `rankRow${tier.key === "unreal" ? " isUnreal" : ""}`, "data-tier": tier.key, style: `--tierColor:${tier.color}` },
        el("span", { className: "rankRowName" }, tier.key === "unreal" ? `Unreal · ${data.counts.unreal}/${data.unrealCap}` : tier.label),
        el("span", { className: "rankRowBar" }, el("span", { className: "rankRowFill", style: `--fill:${(data.counts[tier.key] / maxCount) * 100}%` })),
        el("span", { className: "rankRowCount" }, formatNumber(data.counts[tier.key])),
        el("span", { className: "rankRowShare" }, `${((data.counts[tier.key] / data.total) * 100).toFixed(1)}%`),
      ),
    );

  const highlight = (key) => {
    rows.forEach((row) => row.classList.toggle("isDimmed", key !== null && row.dataset.tier !== key));
    donut.querySelectorAll(".rankDonutArc").forEach((arc) => arc.classList.toggle("isDimmed", key !== null && arc.dataset.tier !== key));
  };
  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => highlight(row.dataset.tier));
    row.addEventListener("mouseleave", () => highlight(null));
  });

  const donut = createDonut(data, highlight);
  animateNumber(totalNode, data.total);

  return el(
    "div",
    { className: "rankStats" },
    el("div", { className: "rankDonutWrap" }, donut, el("div", { className: "rankDonutCenter" }, totalNode, el("span", {}, "Ranked players"))),
    el("div", { className: "rankRows" }, rows),
  );
}

export function createRankStatsSection() {
  const body = el("div", {}, createSkeleton({ height: 220 }));
  const load = (modeId) => {
    replaceContent(body, createSkeleton({ height: 220 }));
    getRankDistribution(modeId).then((data) => replaceContent(body, renderDistribution(data)));
  };
  const tabs = createTabs({
    label: "Gamemode",
    tabs: gamemodes.map((mode) => ({ id: mode.id, label: mode.name })),
    active: gamemodes[0].id,
    onChange: load,
  });
  load(gamemodes[0].id);

  return el(
    "section",
    { className: "section compact" },
    el(
      "div",
      { className: "container" },
      el("div", { "data-reveal": "" }, createSectionHeading({ eyebrow: "Season 1", title: "Rank distribution" })),
      el(
        "div",
        { className: "card rankStatsCard", "data-reveal": "" },
        el("div", { className: "toolbar" }, tabs, el("span", { className: "spacer" }), createBadge({ label: "Placeholder data", variant: "primary" })),
        body,
      ),
    ),
  );
}
