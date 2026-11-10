import { el, replaceContent } from "../dom.js?v=112";
import { renderLayout } from "../layout.js?v=112";
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
} from "../components.js?v=112";
import { countries } from "../countries.js?v=112";
import { getTierScore, rankTiers, tierStep, getRankedTier } from "../ranks.js?v=112";
import { createSeasonHistory, gamemodes, getMythicPosition, getPlayer, getPlayerTier, setCountry } from "../mockData.js?v=112";
import { formatDateTime, formatNumber, formatPercent, formatPlaytime, formatRatio } from "../format.js?v=112";

const app = renderLayout("profile");
const modeName = (id) => gamemodes.find((mode) => mode.id === id).name;

const state = {
  player: null,
  activeTab: "overview",
  duelMode: "nodebuff",
  ffaMode: "nodebuff",
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

function renderElo(player) {
  const best = gamemodes
    .map((mode) => ({ mode, rating: player.ratings[mode.id] }))
    .reduce((top, entry) => (entry.rating > top.rating ? entry : top));
  const tier = getPlayerTier(player, best.mode.id);
  const score = getTierScore(best.rating, tier);
  const position = getMythicPosition(player.username, best.mode.id);
  return el(
    "div",
    { className: "profileElo", style: `--tierColor:${tier.color}` },
    el("span", { className: "profileEloLabel" }, score.label),
    el("strong", { className: "profileEloValue" }, score.text),
    createRankedBadge(tier),
    el("span", { className: "mutedText" }, position ? `Best in ${best.mode.name} · #${position}` : `Best in ${best.mode.name}`),
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
    renderElo(player),
  );
}

function createSvgElement(tag, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function createRatingHistory(player, modeId, count = 40) {
  let seed = [...`${player.username}:${modeId}`].reduce((value, char) => value * 31 + char.charCodeAt(0), 7) >>> 0;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const current = player.ratings[modeId];
  const values = [Math.max(0, current - (random() * 620 - 300))];
  for (let index = 1; index < count - 1; index += 1) {
    const previous = values[index - 1];
    const pullToCurrent = (current - previous) * 0.12;
    values.push(Math.max(0, previous + pullToCurrent + (random() - 0.5) * 320));
  }
  values.push(current);
  return values;
}

function createRatingChart(player, modeId, values) {
  const width = 900;
  const height = 270;
  const plot = { left: 52, right: 12, top: 12, bottom: 34 };
  const plotWidth = width - plot.left - plot.right;
  const plotHeight = height - plot.top - plot.bottom;
  const rating = player.ratings[modeId];
  const minRating = Math.max(0, Math.floor((Math.min(rating - 500, ...values) - 50) / tierStep) * tierStep);
  const maxRating = Math.max(minRating + tierStep * 3, Math.ceil((Math.max(rating + 350, ...values) + 50) / tierStep) * tierStep);
  const y = (value) => plot.top + ((maxRating - value) / (maxRating - minRating)) * plotHeight;
  const svg = createSvgElement("svg", {
    class: "ratingChart",
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": `Rating progression for ${modeName(modeId)}: current rating ${formatNumber(rating)}`,
    preserveAspectRatio: "none",
  });
  const bands = [
    ...rankTiers.slice(0, 3).flatMap((division, divisionIndex) =>
      Array.from({ length: 3 }, (_, tierIndex) => ({
        low: (divisionIndex * 3 + tierIndex) * tierStep,
        high: (divisionIndex * 3 + tierIndex + 1) * tierStep,
        color: division.color,
      })),
    ),
    { low: 9 * tierStep, high: maxRating, color: rankTiers[3].color },
  ];

  bands.forEach(({ low, high, color }) => {
    const from = Math.max(low, minRating);
    const to = Math.min(high, maxRating);
    if (to <= from) return;
    svg.append(createSvgElement("rect", {
      x: plot.left,
      y: y(to),
      width: plotWidth,
      height: y(from) - y(to),
      fill: color,
      opacity: "0.12",
    }));
    svg.append(createSvgElement("line", {
      x1: plot.left,
      x2: width - plot.right,
      y1: y(to),
      y2: y(to),
      class: "ratingChartGrid",
    }));
    if (from === low && low >= minRating) {
      const tier = getRankedTier(low);
      const label = createSvgElement("text", { x: plot.left + 8, y: y(to) + 15, class: "ratingChartTier" });
      label.textContent = tier.name;
      svg.append(label);
    }
  });

  Array.from({ length: 5 }, (_, index) => {
    const value = maxRating - ((maxRating - minRating) / 4) * index;
    const label = createSvgElement("text", {
      x: plot.left - 8,
      y: y(value) + 4,
      class: "ratingChartScale",
      "text-anchor": "end",
    });
    label.textContent = formatNumber(Math.round(value));
    svg.append(label);
  });

  const points = values.map((value, index) => `${plot.left + (index / (values.length - 1)) * plotWidth},${y(value)}`).join(" ");
  svg.append(createSvgElement("polyline", { points, class: "ratingChartLine" }));
  svg.append(createSvgElement("circle", {
    cx: width - plot.right,
    cy: y(rating),
    r: "4",
    class: "ratingChartPoint",
  }));

  const now = new Date();
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1);
    const text = createSvgElement("text", {
      x: plot.left + (index / 6) * plotWidth,
      y: height - 8,
      class: "ratingChartDate",
      "text-anchor": index === 0 ? "start" : index === 6 ? "end" : "middle",
    });
    text.textContent = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    svg.append(text);
  });

  return svg;
}

function renderRatingProgression(player, modeId) {
  const summary = el("div", { className: "ratingProgressionSummary", "aria-live": "polite" });
  const chart = el("div", { className: "ratingChartWrap", tabindex: "0", role: "region", "aria-label": "Rating history chart" });
  const paint = () => {
    const rating = player.ratings[modeId];
    const tier = getPlayerTier(player, modeId);
    const history = createRatingHistory(player, modeId);
    const divisionChanges = history.slice(1).reduce(
      (changes, value, index) => {
        const previousDivision = rankTiers.findIndex((division) => division.key === getRankedTier(history[index]).key);
        const currentDivision = rankTiers.findIndex((division) => division.key === getRankedTier(value).key);
        if (currentDivision > previousDivision) changes.up += 1;
        if (currentDivision < previousDivision) changes.down += 1;
        return changes;
      },
      { up: 0, down: 0 },
    );
    replaceContent(
      summary,
      el("div", {}, el("span", { className: "mutedText" }, "Division"), el("strong", { style: `--tierColor:${tier.color}` }, tier.name)),
      el("div", {}, el("span", { className: "mutedText" }, "Rating"), el("strong", {}, formatNumber(rating))),
      el("div", {}, el("span", { className: "mutedText" }, "Division up"), el("strong", { className: "ratingChangeUp" }, `↑ ${divisionChanges.up}`)),
      el("div", {}, el("span", { className: "mutedText" }, "Division down"), el("strong", { className: "ratingChangeDown" }, `↓ ${divisionChanges.down}`)),
      el("div", {}, el("span", { className: "mutedText" }, "Matches"), el("strong", {}, formatNumber(player.perMode[modeId].wins + player.perMode[modeId].losses))),
    );
    replaceContent(chart, createRatingChart(player, modeId, history));
  };
  paint();
  return el(
    "section",
    { className: "card ratingProgression", "aria-labelledby": "ratingProgressionTitle" },
    el("div", { className: "ratingProgressionHeader" },
      el("h2", { id: "ratingProgressionTitle" }, "Rating progression"),
      createRankedBadge(getPlayerTier(player, modeId)),
    ),
    summary,
    chart,
  );
}

function statGrid(stats) {
  return el("div", { className: "grid cols4 statGrid" }, stats.map((stat) => createStatCard(stat)));
}

function renderOverview(player) {
  const { overall } = player;
  return el("div", { className: "stack" },
    el("section", { className: "stack" },
      el("h2", {}, "Match statistics"),
      statGrid([
        { label: "Wins", icon: "trophy", value: formatNumber(overall.wins) },
        { label: "Losses", icon: "close", value: formatNumber(overall.losses) },
        { label: "Win Rate", icon: "percent", value: formatPercent(overall.wins, overall.wins + overall.losses), accent: true },
        { label: "Matches", icon: "crosshair", value: formatNumber(overall.wins + overall.losses) },
      ]),
    ),
    el("section", { className: "stack" },
      el("h2", {}, "Combat and activity"),
      statGrid([
        { label: "Kills", icon: "sword", value: formatNumber(overall.kills) },
        { label: "Deaths", icon: "skull", value: formatNumber(overall.deaths) },
        { label: "K/D Ratio", icon: "crosshair", value: formatRatio(overall.kills, overall.deaths), accent: true },
        { label: "Playtime", icon: "clock", value: formatPlaytime(overall.playtimeHours) },
      ]),
    ),
    renderSeasonHistory(player),
  );
}

function renderModeStatistics(player, type) {
  const panel = el("div", { className: "stack" });
  const stateKey = type === "duels" ? "duelMode" : "ffaMode";
  const paint = () => {
    const modeId = state[stateKey];
    const stats = type === "duels" ? player.perMode[modeId] : player.perFfaMode[modeId];
    const matches = el("div");
    if (type === "duels") renderMatches(player, matches, modeId);
    replaceContent(panel,
      el("h2", {}, `${modeName(modeId)} ${type === "duels" ? "duels" : "FFA"}`),
      type === "duels"
        ? statGrid([
            { label: "Wins", icon: "trophy", value: formatNumber(stats.wins) },
            { label: "Losses", icon: "close", value: formatNumber(stats.losses) },
            { label: "Win Rate", icon: "percent", value: formatPercent(stats.wins, stats.wins + stats.losses), accent: true },
            { label: "Matches", icon: "crosshair", value: formatNumber(stats.wins + stats.losses) },
          ])
        : null,
      statGrid([
        { label: "Kills", icon: "sword", value: formatNumber(stats.kills) },
        { label: "Deaths", icon: "skull", value: formatNumber(stats.deaths) },
        { label: "K/D Ratio", icon: "crosshair", value: formatRatio(stats.kills, stats.deaths), accent: true },
        ...(type === "ffa" ? [{ label: "Best Kill Streak", icon: "flame", value: stats.bestKillStreak }] : []),
      ]),
      type === "duels" ? renderRatingProgression(player, modeId) : null,
      type === "duels" ? el("section", { className: "stack" }, el("h2", {}, "Recent matches"), matches) : null,
    );
  };
  paint();
  return panel;
}

const tabRenderers = {
  overview: renderOverview,
  duels: (player) => renderModeStatistics(player, "duels"),
  ffa: (player) => renderModeStatistics(player, "ffa"),
};

function renderMatches(player, container, modeId) {
  const matches = player.recentMatches.filter(
    (match) => match.gamemode === modeId,
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

function renderSeasonHistory(player) {
  return el(
    "div",
    { className: "seasonHistory" },
    el("h2", {}, "Season history"),
    el(
      "div",
      { className: "seasonList" },
      createSeasonHistory(player).map((entry) =>
        el(
          "div",
          { className: "seasonEntry" },
          el("span", { className: "seasonName" }, entry.season),
          createRankedBadge(entry.tier),
          el("span", { className: "mutedText" }, `Highest · ${entry.modeName}`),
        ),
      ),
    ),
  );
}

function renderProfile(player) {
  const tabPanel = el("div", { id: "profileStatsPanel", role: "region", "aria-label": "Player statistics" });

  const paintTab = () => replaceContent(tabPanel, tabRenderers[state.activeTab](player));
  const tabs = el("div", { className: "tabs profileStatsNav", role: "group", "aria-label": "Statistics" });
  const categories = [
    { id: "overview", label: "Overview" },
    { id: "duels", label: "Duels" },
    { id: "ffa", label: "FFA" },
  ];
  const modeLists = {};
  const buttons = {};
  const selectCategory = (id) => {
    state.activeTab = id;
    categories.forEach((category) => {
      const active = category.id === id;
      buttons[category.id].setAttribute("aria-pressed", String(active));
      if (category.id !== "overview") {
        buttons[category.id].setAttribute("aria-expanded", String(active));
        modeLists[category.id].hidden = !active;
      }
    });
    paintTab();
  };
  categories.forEach(({ id, label }) => {
    buttons[id] = el("button", {
      className: "tab",
      type: "button",
      "aria-controls": id === "overview" ? "profileStatsPanel" : `${id}ModeTabs`,
      onClick: () => selectCategory(id),
    }, label);
    tabs.append(buttons[id]);
    if (id === "overview") return;
    const stateKey = id === "duels" ? "duelMode" : "ffaMode";
    const modeList = createTabs({
      label: id === "duels" ? "Duel gamemode" : "FFA gamemode",
      active: state[stateKey],
      tabs: gamemodes.map((mode) => ({ id: mode.id, label: mode.name })),
      onChange: (modeId) => {
        state[stateKey] = modeId;
        paintTab();
      },
    });
    modeList.id = `${id}ModeTabs`;
    modeList.classList.add("profileModeTabs");
    modeLists[id] = modeList;
    tabs.append(modeList);
  });

  selectCategory(state.activeTab);

  replaceContent(
    content,
    renderHeader(player),
    tabs,
    tabPanel,
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
