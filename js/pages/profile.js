import { el, replaceContent } from "../dom.js?v=38";
import { renderLayout } from "../layout.js?v=38";
import {
  createAvatar,
  createBadge,
  createButton,
  createDropdown,
  createEmptyState,
  createPlayerName,
  createRankBadge,
  createSectionHeading,
  createSkeleton,
  createStatCard,
  createTable,
  createRankedBadge,
  createTabs,
  withTooltip,
} from "../components.js?v=38";
import { countries } from "../countries.js?v=38";
import { gamemodes, getPlayer, getPlayerTier, setCountry } from "../mockData.js?v=38";
import { formatDateTime, formatNumber, formatPercent, formatPlaytime, formatRatio } from "../format.js?v=38";

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

function renderCountryPicker(player) {
  const dropdown = createDropdown({
    label: "Country",
    value: player.country ?? "",
    options: [{ value: "", label: "No flag" }, ...countries.map((country) => ({ value: country.code, label: country.name }))],
    onChange: async (code) => {
      await setCountry(player.username, code || null);
      loadPlayer(player.username);
    },
  });
  return el("div", { className: "countryPicker" }, el("span", { className: "mutedText" }, "Country flag"), dropdown, createBadge({ label: "Saved in this browser only" }));
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
        el("h1", {}, createPlayerName(player.username, { country: player.country, flagSize: "large" })),
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
      renderCountryPicker(player),
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
      { label: "Division", align: "right", render: (row) => createRankedBadge(row.tier) },
    ],
    rows: gamemodes.map((mode) => ({
      name: mode.name,
      rating: player.ratings[mode.id],
      tier: getPlayerTier(player, mode.id),
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
        createRankedBadge(getPlayerTier(player, mode.id)),
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
            { label: "Opponent", render: (row) => createPlayerName(row.opponent, { country: row.opponentCountry }) },
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
