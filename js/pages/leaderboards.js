import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createEmptyState,
  createPagination,
  createPlayerName,
  createRankedBadge,
  createRankBadge,
  createSectionHeading,
  createSkeleton,
  createTable,
  createTabs,
} from "../components.js";
import { gamemodes, getLeaderboard, leaderboardCategories } from "../mockData.js";
import { modeIconStyle, modeThemes } from "../modeTheme.js";
import { createRankDistributionCard } from "./rankStats.js";
import { getRankedTier, rankTiers, unrealCap } from "../ranks.js";
import { formatNumber } from "../format.js";

const app = renderLayout("leaderboards");

const groups = [
  { id: "overall", label: "Overall", categories: ["overall", "duels"] },
  { id: "ranked", label: "Ranked Duels", categories: gamemodes.map((mode) => mode.id) },
  { id: "ffa", label: "FFA", categories: ["ffa"] },
];
const subLabels = { overall: "Avg. Rating", duels: "Duel Wins" };

const pageSize = 15;
const state = { group: "overall", category: "overall", requestId: 0, page: 1, entries: [] };
const results = el("div", { "aria-live": "polite" });
const subNav = el("div", { className: "boardSubNav" });

const getCategory = (id) => leaderboardCategories.find((item) => item.id === id);
const isRanked = () => state.group === "ranked";

function renderSubNav() {
  const group = groups.find((item) => item.id === state.group);
  if (group.categories.length === 1) return replaceContent(subNav);
  replaceContent(
    subNav,
    createTabs({
      label: "Leaderboard category",
      active: state.category,
      tabs: group.categories.map((id) => ({ id, label: subLabels[id] ?? getCategory(id).label })),
      onChange: (id) => {
        state.category = id;
        renderSubNav();
        loadLeaderboard();
      },
    }),
  );
}

const groupTabs = createTabs({
  label: "Leaderboard group",
  active: state.group,
  tabs: groups.map((group) => ({ id: group.id, label: group.label })),
  onChange: (id) => {
    state.group = id;
    state.category = groups.find((group) => group.id === id).categories[0];
    renderSubNav();
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
    el("div", { className: "boardNav" }, groupTabs, createBadge({ label: "All regions · shared" })),
    subNav,
    results,
    el("p", { className: "placeholderNote" }, "Rankings combine all regions. Sample data until real leaderboards are connected."),
  ),
);

function renderTierCell(row) {
  return isRanked() ? createRankedBadge(getRankedTier(row.metric, { isUnreal: true })) : createRankBadge(row.rank);
}

function renderPodium(entries) {
  const theme = isRanked() ? modeThemes[state.category] : null;
  const order = [entries[1], entries[0], entries[2]].filter(Boolean);
  return el(
    "div",
    { className: "podium", style: theme ? `--accent:${theme.accent};--panel:${theme.panel};--edge:${theme.edge}` : "" },
    order.map((entry) =>
      el(
        "a",
        { className: `podiumCard place${entry.position}`, href: `profile.html?player=${encodeURIComponent(entry.username)}` },
        el("span", { className: "podiumPlace" }, `#${entry.position}`),
        createAvatar({ username: entry.username, skinUrl: entry.skinUrl }),
        createPlayerName(entry.username, { country: entry.country }),
        renderTierCell(entry),
        el("strong", { className: "podiumValue" }, formatNumber(entry.metric)),
      ),
    ),
  );
}

function renderTable(entries) {
  const category = getCategory(state.category);
  const tableEntries = entries.slice(3);
  const pageCount = Math.ceil(tableEntries.length / pageSize);
  state.page = Math.min(state.page, pageCount);
  const table = createTable({
    caption: `${category.label} leaderboard`,
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
      { label: isRanked() ? "Tier" : "Rank", hideOnMobile: true, render: renderTierCell },
      { label: category.metricLabel, align: "right", render: (row) => el("span", { className: "metricValue" }, formatNumber(row.metric)) },
    ],
    rows: tableEntries.slice((state.page - 1) * pageSize, state.page * pageSize),
  });
  if (pageCount <= 1) return table;
  return el(
    "div",
    { className: "stack" },
    table,
    createPagination({
      page: state.page,
      pageCount,
      total: tableEntries.length,
      pageSize,
      offset: 3,
      onChange: (page) => {
        state.page = page;
        renderBoard();
      },
    }),
  );
}

function renderBoardHeader(entries) {
  const category = getCategory(state.category);
  const theme = isRanked() ? modeThemes[state.category] : null;
  return el(
    "div",
    { className: "boardHeader", style: theme ? `--accent:${theme.accent}` : "" },
    theme ? el("span", { className: "modeIcon small", style: modeIconStyle(state.category), "aria-hidden": "true" }) : null,
    el("div", {}, el("h2", {}, category.label), el("p", {}, isRanked() ? `Unreal ladder · top ${unrealCap} only` : `Ranked by ${category.metricLabel.toLowerCase()}`)),
  );
}

function renderBoard() {
  const entries = state.entries;
  replaceContent(
    results,
    entries.length === 0
      ? createEmptyState({ title: "No data yet", text: "No Unreal players yet." })
      : el(
          "div",
          { className: "boardStack" },
          renderBoardHeader(entries),
          renderPodium(entries),
          entries.length > 3 ? renderTable(entries) : null,
          isRanked() ? el("div", {}, createRankDistributionCard(state.category)) : null,
        ),
  );
}

async function loadLeaderboard() {
  const requestId = ++state.requestId;
  state.page = 1;
  replaceContent(results, el("div", { className: "stack" }, Array.from({ length: 6 }, () => createSkeleton({ height: 52 }))));

  const entries = await getLeaderboard(state.category);
  if (requestId !== state.requestId) return;
  state.entries = entries;
  renderBoard();
}

renderSubNav();
loadLeaderboard();
