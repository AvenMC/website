import { el, replaceContent } from "../dom.js?v=88";
import { createBadge, createSectionHeading, createSkeleton, createTabs } from "../components.js?v=88";
import { currentSeason, gamemodes, getRankDistribution } from "../mockData.js?v=88";
import { rankTiers } from "../ranks.js?v=88";
import { formatNumber } from "../format.js?v=88";

function animateNumber(node, target, duration = 900) {
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    node.textContent = formatNumber(Math.round(target * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderDistribution(data) {
  const totalNode = el("strong", {}, "0");
  const tiers = rankTiers.slice().reverse();
  const percent = (tier) => ((data.counts[tier.key] / data.total) * 100).toFixed(1);

  // Tiny divisions still get a visible sliver.
  const segments = tiers.map((tier) =>
    el("span", {
      className: "rankSegment",
      "data-tier": tier.key,
      style: `--tierColor:${tier.color};--share:${Math.max((data.counts[tier.key] / data.total) * 100, 1.2)}`,
      "aria-label": `${tier.label}: ${formatNumber(data.counts[tier.key])} players`,
    }),
  );
  const legend = tiers.map((tier) =>
    el(
      "li",
      { className: "rankLegendItem", "data-tier": tier.key, style: `--tierColor:${tier.color}` },
      el("span", { className: "rankLegendName" }, el("span", { className: "rankLegendDot", "aria-hidden": "true" }), tier.label),
      el("strong", {}, formatNumber(data.counts[tier.key])),
      el("span", { className: "rankLegendShare" }, `${percent(tier)}%`),
    ),
  );

  const highlight = (key) => {
    [...segments, ...legend].forEach((node) => node.classList.toggle("isDimmed", key !== null && node.dataset.tier !== key));
  };
  [...segments, ...legend].forEach((node) => {
    node.addEventListener("mouseenter", () => highlight(node.dataset.tier));
    node.addEventListener("mouseleave", () => highlight(null));
  });

  animateNumber(totalNode, data.total);
  // Segments grow in after the first paint.
  const bar = el("div", { className: "rankBar", role: "img", "aria-label": "Division distribution" }, segments);
  requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add("isFilled")));

  return el(
    "div",
    { className: "rankStats" },
    el("p", { className: "rankStatsTotal" }, totalNode, el("span", {}, "ranked players")),
    bar,
    el("ul", { className: "rankLegend" }, legend),
  );
}

export function createRankStatsSection({ pageHeading = false } = {}) {
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
      el("div", { "data-reveal": "" }, createSectionHeading({ eyebrow: currentSeason.name, title: "Division distribution", level: pageHeading ? "h1" : "h2" })),
      el(
        "div",
        { className: "card rankStatsCard", "data-reveal": "" },
        el("div", { className: "toolbar" }, tabs, el("span", { className: "spacer" }), createBadge({ label: "Placeholder data", variant: "primary" })),
        body,
      ),
    ),
  );
}

export function createRankDistributionCard(modeId) {
  const body = el("div", {}, createSkeleton({ height: 220 }));
  getRankDistribution(modeId).then((data) => replaceContent(body, renderDistribution(data)));
  return el(
    "div",
    { className: "card rankStatsCard" },
    el("div", { className: "toolbar" }, el("h3", {}, `${currentSeason.name} division distribution`), el("span", { className: "spacer" }), createBadge({ label: "Placeholder data", variant: "primary" })),
    body,
  );
}
