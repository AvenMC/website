import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createDropdown,
  createEmptyState,
  createRankBadge,
  createSectionHeading,
  createSkeleton,
  createTable,
  createTabs,
} from "../components.js";
import { getLeaderboard, leaderboardCategories, regions } from "../mockData.js";
import { formatNumber } from "../format.js";

const app = renderLayout("leaderboards");
const state = { category: "overall", region: "eu", requestId: 0 };
const results = el("div", { "aria-live": "polite" });

const tabs = createTabs({
  label: "Leaderboard category",
  active: state.category,
  tabs: leaderboardCategories.map((category) => ({ id: category.id, label: category.label })),
  onChange: (id) => {
    state.category = id;
    loadLeaderboard();
  },
});

const regionDropdown = createDropdown({
  label: "Region",
  value: state.region,
  options: regions.map((region) => ({ value: region.id, label: `${region.code} — ${region.location}` })),
  onChange: (id) => {
    state.region = id;
    loadLeaderboard();
  },
});

replaceContent(
  app,
  el(
    "div",
    { className: "container" },
    el(
      "div",
      { className: "pageHeader" },
      createSectionHeading({ eyebrow: "Leaderboards", title: "Top players", level: "h1" }),
      createBadge({ label: "Placeholder data", variant: "primary" }),
    ),
    el("div", { className: "toolbar" }, tabs, el("span", { className: "spacer" }), regionDropdown),
    results,
    el("p", { className: "placeholderNote" }, "Rankings are generated sample data until real leaderboards are connected."),
  ),
);

function renderTable(entries) {
  const category = leaderboardCategories.find((item) => item.id === state.category);

  return createTable({
    caption: `${category.label} leaderboard`,
    rowClass: (_, index) => (index < 3 ? `rowTop${index + 1}` : ""),
    columns: [
      { label: "#", render: (row) => el("span", { className: "positionBadge" }, row.position) },
      {
        label: "Player",
        render: (row) =>
          el(
            "a",
            { className: "cellPlayer", href: `profile.html?player=${encodeURIComponent(row.username)}` },
            createAvatar({ username: row.username, skinUrl: row.skinUrl }),
            row.username,
          ),
      },
      { label: "Rank", hideOnMobile: true, render: (row) => createRankBadge(row.rank) },
      {
        label: category.metricLabel,
        align: "right",
        render: (row) => el("span", { className: "metricValue" }, formatNumber(row.metric)),
      },
    ],
    rows: entries,
  });
}

async function loadLeaderboard() {
  const requestId = ++state.requestId;
  replaceContent(results, el("div", { className: "stack" }, Array.from({ length: 6 }, () => createSkeleton({ height: 52 }))));

  const entries = await getLeaderboard(state.category, state.region);
  if (requestId !== state.requestId) return;

  replaceContent(
    results,
    entries.length === 0
      ? createEmptyState({ title: "No data yet", text: "This region is not available yet." })
      : renderTable(entries),
  );
}

loadLeaderboard();
