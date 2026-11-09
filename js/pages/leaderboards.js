import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createEmptyState,
  createPlayerName,
  createRankBadge,
  createSectionHeading,
  createSkeleton,
  createTable,
  createTabs,
} from "../components.js";
import { getLeaderboard, leaderboardCategories } from "../mockData.js";
import { formatNumber } from "../format.js";

const app = renderLayout("leaderboards");
const state = { category: "overall", requestId: 0 };
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
    el("div", { className: "toolbar" }, tabs, el("span", { className: "spacer" }), createBadge({ label: "All regions" })),
    results,
    el("p", { className: "placeholderNote" }, "Rankings combine all regions. Sample data until real leaderboards are connected."),
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
            createPlayerName(row.username, { country: row.country }),
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

  const entries = await getLeaderboard(state.category);
  if (requestId !== state.requestId) return;

  replaceContent(
    results,
    entries.length === 0
      ? createEmptyState({ title: "No data yet", text: "Rankings appear once players have finished matches." })
      : renderTable(entries),
  );
}

loadLeaderboard();
