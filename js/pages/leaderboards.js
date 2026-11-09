import { el, replaceContent } from "../dom.js?v=59";
import { renderLayout } from "../layout.js?v=59";
import {
  createAvatar,
  createBadge,
  createEmptyState,
  createPagination,
  createPlayerName,
  createRankedBadge,
  createRankBadge,
  createSectionHeading,
  createSkeletonRows,
  createTable,
  createTabs,
} from "../components.js?v=59";
import { gamemodes, getLeaderboard, leaderboardCategories } from "../mockData.js?v=59";
import { modeIconStyle, modeThemes } from "../modeTheme.js?v=59";
import { createRankDistributionCard } from "./rankStats.js?v=59";
import { getRankedTier, rankedBoardSize } from "../ranks.js?v=59";
import { formatNumber } from "../format.js?v=59";

const app = renderLayout("leaderboards");

const groups = [
  { id: "overall", label: "Overall", categories: ["overall", "duels"] },
  { id: "ranked", label: "Ranked Duels", categories: gamemodes.map((mode) => mode.id) },
  { id: "ffa", label: "FFA", categories: ["ffa"] },
];
const subLabels = { overall: "Avg. Rating", duels: "Duel Wins" };

const pageSize = 15;
// The board is selected with ?board=<id>, e.g. leaderboards.html?board=nodebuff
const boardParam = new URLSearchParams(location.search).get("board");
const initialGroup = groups.find((group) => group.categories.includes(boardParam)) ?? groups[0];
const state = { group: initialGroup.id, category: initialGroup.categories.includes(boardParam) ? boardParam : initialGroup.categories[0], requestId: 0, page: 1, entries: [] };

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set("board", state.category);
  history.replaceState(null, "", url);
}
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
        syncUrl();
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
    syncUrl();
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
  return isRanked() ? createRankedBadge(getRankedTier(row.metric)) : createRankBadge(row.rank);
}

const formatScore = (row) => formatNumber(row.metric);

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
        el("strong", { className: "podiumValue" }, formatScore(entry)),
      ),
    ),
  );
}

function renderTable(entries, pageEntries) {
  const category = getCategory(state.category);
  const pageCount = Math.ceil(entries.length / pageSize);
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
      { label: isRanked() ? "Division" : "Rank", hideOnMobile: true, render: renderTierCell },
      { label: isRanked() ? "Points" : category.metricLabel, align: "right", render: (row) => el("span", { className: "metricValue" }, formatScore(row)) },
    ],
    rows: pageEntries,
  });
  if (pageCount <= 1) return table;
  return el(
    "div",
    { className: "stack" },
    table,
    createPagination({
      page: state.page,
      pageCount,
      total: entries.length,
      pageSize,
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
    el("div", {}, el("h2", {}, category.label), el("p", {}, isRanked() ? `Top ${rankedBoardSize} Mythic players by points` : `Ranked by ${category.metricLabel.toLowerCase()}`)),
  );
}

function renderBoard() {
  const entries = state.entries;
  state.page = Math.min(state.page, Math.max(1, Math.ceil(entries.length / pageSize)));
  const pageStart = (state.page - 1) * pageSize;
  // Page one shows the top three on the podium, the table continues from there.
  const pageEntries = entries.slice(pageStart + (state.page === 1 ? 3 : 0), pageStart + pageSize);
  replaceContent(
    results,
    entries.length === 0
      ? createEmptyState({ title: "No data yet", text: "No ranked players yet." })
      : el(
          "div",
          { className: "boardStack" },
          renderBoardHeader(entries),
          state.page === 1 ? renderPodium(entries) : null,
          pageEntries.length > 0 ? renderTable(entries, pageEntries) : null,
          isRanked() ? el("div", {}, createRankDistributionCard(state.category)) : null,
        ),
  );
}

async function loadLeaderboard() {
  const requestId = ++state.requestId;
  state.page = 1;
  replaceContent(results, createSkeletonRows(8));

  const entries = await getLeaderboard(state.category);
  if (requestId !== state.requestId) return;
  state.entries = entries;
  renderBoard();
}

renderSubNav();
loadLeaderboard();
