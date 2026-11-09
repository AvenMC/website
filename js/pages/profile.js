import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createButton,
  createDropdown,
  createEmptyState,
  createRankBadge,
  createSectionHeading,
  createSkeleton,
  createStatCard,
  createTable,
  createTabs,
  withTooltip,
} from "../components.js";
import { gamemodes, getPlayer, getTier } from "../mockData.js";
import { formatDateTime, formatNumber, formatPercent, formatPlaytime, formatRatio } from "../format.js";

const app = renderLayout("profile");
const modeName = (id) => gamemodes.find((mode) => mode.id === id).name;

const state = {
  player: null,
  activeTab: "overview",
  matchFilter: "all",
};

const searchInput = el("input", {
  className: "input",
  type: "search",
  name: "player",
  placeholder: "Search player",
  "aria-label": "Search player",
  value: new URLSearchParams(location.search).get("player") ?? "",
});

const searchForm = el(
  "form",
  {
    className: "profileSearch",
    onSubmit: (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();
      history.replaceState(null, "", query ? `?player=${encodeURIComponent(query)}` : location.pathname);
      loadPlayer(query);
    },
  },
  searchInput,
  createButton({ label: "Search", type: "submit" }),
);

const content = el("div", { className: "stack" });

replaceContent(
  app,
  el(
    "div",
    { className: "container" },
    el(
      "div",
      { className: "pageHeader" },
      createSectionHeading({ eyebrow: "Player Stats", title: "Player profile", level: "h1" }),
      searchForm,
    ),
    content,
    el("p", { className: "placeholderNote" }, "All statistics shown are placeholder data until the stats API is connected."),
  ),
);

function renderSkeleton() {
  replaceContent(
    content,
    createSkeleton({ height: 140 }),
    el("div", { className: "grid cols4 statGrid" }, Array.from({ length: 8 }, () => createSkeleton({ height: 88 }))),
    createSkeleton({ height: 260 }),
  );
}

function renderHeader(player) {
  return el(
    "div",
    { className: "card isHighlighted profileHeader" },
    createAvatar({ username: player.username, skinUrl: player.skinUrl, size: "large" }),
    el(
      "div",
      { className: "profileInfo" },
      el(
        "div",
        { className: "profileName" },
        el("h1", {}, player.username),
        createRankBadge(player.rank),
        createBadge({ label: "Placeholder data" }),
      ),
      el(
        "div",
        { className: "levelRow" },
        el("span", { className: "levelLabel" }, `LVL ${player.level}`),
        el(
          "div",
          {
            className: "progress",
            role: "progressbar",
            "aria-label": "Level progress",
            "aria-valuemin": "0",
            "aria-valuemax": "100",
            "aria-valuenow": String(Math.round(player.levelProgress * 100)),
          },
          el("div", { className: "progressFill", style: `width:${player.levelProgress * 100}%` }),
        ),
        el("span", { className: "mutedText" }, `${Math.round(player.levelProgress * 100)}%`),
      ),
    ),
  );
}

function statGrid(stats) {
  return el("div", { className: "grid cols4 statGrid" }, stats.map((stat) => createStatCard(stat)));
}

function renderOverview({ overall }) {
  return statGrid([
    { label: "Kills", value: formatNumber(overall.kills) },
    { label: "Deaths", value: formatNumber(overall.deaths) },
    { label: "K/D Ratio", value: formatRatio(overall.kills, overall.deaths), accent: true },
    { label: "Win Rate", value: formatPercent(overall.wins, overall.wins + overall.losses), accent: true },
    { label: "Wins", value: formatNumber(overall.wins) },
    { label: "Losses", value: formatNumber(overall.losses) },
    { label: "Playtime", value: formatPlaytime(overall.playtimeHours) },
  ]);
}

function renderRatingsTable(player) {
  return createTable({
    caption: "Ranked rating per gamemode",
    columns: [
      { label: "Gamemode", render: (row) => row.name },
      {
        label: "Rating",
        align: "right",
        render: (row) => withTooltip(el("span", { className: "metricValue" }, formatNumber(row.rating)), "Placeholder rating"),
      },
      { label: "Tier", align: "right", render: (row) => createBadge({ label: row.tier, variant: "primary" }) },
    ],
    rows: gamemodes.map((mode) => ({
      name: mode.name,
      rating: player.ratings[mode.id],
      tier: getTier(player.ratings[mode.id]),
    })),
  });
}

function renderDuels(player) {
  const { duels } = player;
  return el(
    "div",
    { className: "stack" },
    statGrid([
      { label: "Duel Wins", value: formatNumber(duels.wins) },
      { label: "Duel Losses", value: formatNumber(duels.losses) },
      { label: "Win Rate", value: formatPercent(duels.wins, duels.wins + duels.losses), accent: true },
      { label: "Best Win Streak", value: duels.bestWinStreak },
    ]),
    renderRatingsTable(player),
  );
}

function renderFfa({ ffa }) {
  return statGrid([
    { label: "Kills", value: formatNumber(ffa.kills) },
    { label: "Deaths", value: formatNumber(ffa.deaths) },
    { label: "K/D Ratio", value: formatRatio(ffa.kills, ffa.deaths), accent: true },
    { label: "Best Kill Streak", value: ffa.bestKillStreak },
  ]);
}

function renderGamemodes(player) {
  return el(
    "div",
    { className: "grid cols3" },
    gamemodes.map((mode) => {
      const stats = player.perMode[mode.id];
      return el(
        "div",
        { className: "card stack" },
        el("h3", {}, mode.name),
        createBadge({ label: getTier(player.ratings[mode.id]), variant: "primary" }),
        el(
          "div",
          { className: "grid cols2 statGrid" },
          createStatCard({ label: "Rating", value: formatNumber(player.ratings[mode.id]), accent: true }),
          createStatCard({ label: "K/D", value: formatRatio(stats.kills, stats.deaths) }),
          createStatCard({ label: "Wins", value: formatNumber(stats.wins) }),
          createStatCard({ label: "Losses", value: formatNumber(stats.losses) }),
        ),
      );
    }),
  );
}

const tabRenderers = {
  overview: renderOverview,
  duels: renderDuels,
  ffa: renderFfa,
  gamemodes: renderGamemodes,
};

function renderMatches(player, container) {
  const matches = player.recentMatches.filter(
    (match) => state.matchFilter === "all" || match.gamemode === state.matchFilter,
  );

  replaceContent(
    container,
    matches.length === 0
      ? createEmptyState({ title: "No matches found", text: "No recent matches for this gamemode." })
      : createTable({
          caption: "Recent matches",
          columns: [
            { label: "Gamemode", render: (row) => modeName(row.gamemode) },
            {
              label: "Result",
              render: (row) => el("span", { className: row.result === "Win" ? "resultWin" : "resultLoss" }, row.result),
            },
            { label: "Score", key: "score" },
            { label: "Opponent", key: "opponent" },
            { label: "Date", align: "right", render: (row) => el("span", { className: "mutedText" }, formatDateTime(row.playedAt)) },
          ],
          rows: matches,
        }),
  );
}

function renderProfile(player) {
  const tabPanel = el("div", { role: "tabpanel" });
  const matchesPanel = el("div");

  const paintTab = () => replaceContent(tabPanel, tabRenderers[state.activeTab](player));

  const tabs = createTabs({
    label: "Statistics",
    active: state.activeTab,
    tabs: [
      { id: "overview", label: "Overview" },
      { id: "duels", label: "Duels" },
      { id: "ffa", label: "FFA" },
      { id: "gamemodes", label: "Gamemodes" },
    ],
    onChange: (id) => {
      state.activeTab = id;
      paintTab();
    },
  });

  const filter = createDropdown({
    label: "Filter matches by gamemode",
    value: state.matchFilter,
    options: [{ value: "all", label: "All gamemodes" }, ...gamemodes.map((mode) => ({ value: mode.id, label: mode.name }))],
    onChange: (value) => {
      state.matchFilter = value;
      renderMatches(player, matchesPanel);
    },
  });

  paintTab();
  renderMatches(player, matchesPanel);

  replaceContent(
    content,
    renderHeader(player),
    tabs,
    tabPanel,
    el("div", { className: "toolbar" }, el("h2", {}, "Recent matches"), el("span", { className: "spacer" }), filter),
    matchesPanel,
  );
}

async function loadPlayer(query) {
  renderSkeleton();
  state.player = await getPlayer(query);
  if (!state.player) {
    replaceContent(
      content,
      createEmptyState({ title: "Player not found", text: "Try one of the placeholder players, e.g. SamplePlayer01." }),
    );
    return;
  }
  renderProfile(state.player);
}

loadPlayer(searchInput.value);
