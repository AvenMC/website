/*
 * Mock data layer. Every value here is placeholder data generated locally.
 * Replace the exported async functions with real API calls once a backend exists;
 * the pages only depend on the shapes returned here.
 */

import { countries } from "./countries.js?v=85";
import { getRankedTier, mythicMinRating, rankedBoardSize } from "./ranks.js?v=85";

export const gamemodes = [
  { id: "nodebuff", name: "Nodebuff", short: "NB", description: "Classic potion PvP." },
  { id: "crystalpvp", name: "CrystalPvP", short: "CP", description: "End crystal combat." },
  { id: "spearmace", name: "SpearMace", short: "SM", description: "Spear and mace combat." },
];

// Accounts, stats and leaderboards are shared across all regions.
export const regions = [
  { id: "eu", code: "EU", location: "Frankfurt", status: "At release" },
  { id: "na", code: "NA", location: "New York", status: "At release" },
  { id: "as", code: "AS", location: "To be announced", status: "Potential" },
];

const mockDelayMs = 350;
const ranks = ["Member", "Member", "Member", "VIP", "VIP", "Elite"];
function createRandom(seed) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random, min, max) => Math.floor(min + random() * (max - min));

function createPlayer(index) {
  const random = createRandom(index * 9973 + 17);
  const username = `SamplePlayer${String(index + 1).padStart(2, "0")}`;
  const ratings = Object.fromEntries(
    gamemodes.map((mode) => [mode.id, between(random, 700, 2650)]),
  );
  const perMode = Object.fromEntries(
    gamemodes.map((mode) => [
      mode.id,
      {
        wins: between(random, 40, 700),
        losses: between(random, 30, 600),
        kills: between(random, 300, 4000),
        deaths: between(random, 250, 3500),
      },
    ]),
  );
  const duels = {
    wins: Object.values(perMode).reduce((sum, mode) => sum + mode.wins, 0),
    losses: Object.values(perMode).reduce((sum, mode) => sum + mode.losses, 0),
    bestWinStreak: between(random, 4, 28),
  };
  const ffa = {
    kills: between(random, 500, 9000),
    deaths: between(random, 400, 8000),
    bestKillStreak: between(random, 6, 45),
  };
  const level = between(random, 5, 90);

  return {
    username,
    country: index % 5 === 4 ? null : countries[between(random, 0, countries.length)].code,
    skinUrl: null,
    rank: ranks[index % ranks.length],
    level,
    joinedAt: new Date(Date.UTC(2025, 0, 1) + between(random, 0, 540) * 86400000).toISOString(),
    levelProgress: Math.round(random() * 100) / 100,
    ratings,
    perMode,
    duels,
    ffa,
    overall: {
      kills: ffa.kills + Object.values(perMode).reduce((sum, mode) => sum + mode.kills, 0),
      deaths: ffa.deaths + Object.values(perMode).reduce((sum, mode) => sum + mode.deaths, 0),
      wins: duels.wins,
      losses: duels.losses,
      playtimeHours: between(random, 20, 900),
    },
    recentMatches: createRecentMatches(random, index),
  };
}

function createRecentMatches(random, index) {
  const baseTime = Date.UTC(2026, 0, 15, 18, 0, 0);
  return Array.from({ length: 8 }, (_, matchIndex) => {
    const mode = gamemodes[between(random, 0, gamemodes.length)];
    const won = random() > 0.45;
    const winnerScore = 100;
    return {
      gamemode: mode.id,
      result: won ? "Win" : "Loss",
      score: won ? `${winnerScore}-${between(random, 20, 95)}` : `${between(random, 20, 95)}-${winnerScore}`,
      opponent: `SamplePlayer${String(((index + matchIndex + 1) % playerCount) + 1).padStart(2, "0")}`,
      opponentCountry: null,
      playedAt: new Date(baseTime - matchIndex * 47 * 60000).toISOString(),
    };
  });
}

// Peak division per finished season, derived from the player's best rating.
const pastSeasons = [
  { name: "Season 2", factor: 0.93 },
  { name: "Season 1", factor: 0.8 },
];

export function createSeasonHistory(player) {
  const best = Math.max(...Object.values(player.ratings));
  return pastSeasons.map((season, index) => {
    const modeIds = Object.keys(player.ratings);
    const modeId = modeIds[(modeIds.length + index) % modeIds.length];
    const rating = Math.round(best * season.factor - index * 37);
    return { season: season.name, modeName: gamemodes.find((mode) => mode.id === modeId).name, tier: getRankedTier(rating) };
  });
}

const playerCount = 300;
const players = Array.from({ length: playerCount }, (_, index) => createPlayer(index));

export function getPlayerTier(player, modeId) {
  return getRankedTier(player.ratings[modeId]);
}

const wait = () => new Promise((resolve) => setTimeout(resolve, mockDelayMs));

export async function getPlayerNames() {
  await wait();
  return players.map((player) => player.username);
}

// Mock persistence: real country selection needs a backend; until then it is kept in this browser only.
const countryStorageKey = (username) => `avenmc.mock.country.${username}`;

export function getCountry(player) {
  try {
    const stored = localStorage.getItem(countryStorageKey(player.username));
    if (stored !== null) return stored === "" ? null : stored;
  } catch {}
  return player.country;
}

export async function setCountry(username, code) {
  await wait();
  try {
    localStorage.setItem(countryStorageKey(username), code ?? "");
  } catch {}
}

export async function getPlayer(username) {
  await wait();
  const query = (username ?? "").trim().toLowerCase();
  const found = query ? players.find((player) => player.username.toLowerCase() === query) : players[0];
  return found ? { ...found, country: getCountry(found) } : null;
}

export const leaderboardCategories = [
  { id: "overall", label: "Overall", metricLabel: "Avg. Rating" },
  { id: "duels", label: "Duels", metricLabel: "Duel Wins" },
  { id: "ffa", label: "FFA", metricLabel: "Kills" },
  ...gamemodes.map((mode) => ({ id: mode.id, label: mode.name, metricLabel: "Rating" })),
];

function getMetric(player, categoryId) {
  if (categoryId === "overall") {
    const values = Object.values(player.ratings);
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }
  if (categoryId === "duels") return Math.max(0, player.duels.wins);
  if (categoryId === "ffa") return Math.max(0, player.ffa.kills);
  return player.ratings[categoryId];
}

function buildEntries(categoryId) {
  const isRankedMode = gamemodes.some((mode) => mode.id === categoryId);
  // Ranked duel boards only list Mythic players.
  const source = isRankedMode ? players.filter((player) => player.ratings[categoryId] >= mythicMinRating) : players;
  return source
    .map((player) => ({
      username: player.username,
      country: getCountry(player),
      skinUrl: player.skinUrl,
      rank: player.rank,
      metric: getMetric(player, categoryId),
    }))
    .sort((a, b) => b.metric - a.metric)
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

// Every Mythic player has a place, even below the listed top rankedBoardSize. Null for other divisions.
export function getMythicPosition(username, modeId) {
  return buildEntries(modeId).find((entry) => entry.username === username)?.position ?? null;
}

export async function getLeaderboard(categoryId) {
  await wait();
  const entries = buildEntries(categoryId);
  return gamemodes.some((mode) => mode.id === categoryId) ? entries.slice(0, rankedBoardSize) : entries;
}

// Stand-in for the signed-in player until accounts exist.
export const mockCurrentUsername = "SamplePlayer42";

// position is null when the player has no leaderboard position (not Mythic on a ranked board).
export async function getMyStanding(categoryId) {
  await wait();
  const me = players.find((player) => player.username === mockCurrentUsername);
  const entry = buildEntries(categoryId).find((item) => item.username === me.username);
  return {
    username: me.username,
    country: getCountry(me),
    skinUrl: me.skinUrl,
    rank: me.rank,
    metric: getMetric(me, categoryId),
    position: entry?.position ?? null,
    isRankedMode: gamemodes.some((mode) => mode.id === categoryId),
  };
}

const previewCache = new Map();

// Compact profile used by the hover card on leaderboards.
export async function getPlayerPreview(username) {
  if (!previewCache.has(username)) {
    previewCache.set(
      username,
      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 120));
        const player = players.find((item) => item.username === username);
        if (!player) return null;
        return {
          username: player.username,
          country: getCountry(player),
          rank: player.rank,
          level: player.level,
          joinedAt: player.joinedAt,
          playtimeHours: player.overall.playtimeHours,
          wins: player.duels.wins,
          losses: player.duels.losses,
          ranked: gamemodes.map((mode) => ({ id: mode.id, name: mode.name, rating: player.ratings[mode.id], tier: getRankedTier(player.ratings[mode.id]), position: getMythicPosition(player.username, mode.id) })),
        };
      })(),
    );
  }
  return previewCache.get(username);
}

export async function getTopPlayersPreview() {
  const entries = await getLeaderboard("overall");
  return entries.slice(0, 3);
}

export const currentSeason = { name: "Season 3", isPlaceholder: true };

const distributionTotals = { nodebuff: { total: 4180, mythic: 62 }, crystalpvp: { total: 2760, mythic: 41 }, spearmace: { total: 1490, mythic: 22 } };
// Share of non-Mythic players per tier, modelled on Fortnite: the lowest tier is the most crowded, with small bumps at each new division.
const tierWeights = { bronze: [107, 88, 71], silver: [72, 63, 58], gold: [57, 51, 39] };
const distributionWeights = Object.fromEntries(Object.entries(tierWeights).map(([key, weights]) => [key, weights.reduce((sum, weight) => sum + weight, 0)]));

// Replace with the real season endpoint once it exists. Keep the returned shape.
export async function getRankDistribution(modeId) {
  await wait();
  const { total, mythic } = distributionTotals[modeId];
  const weightSum = Object.values(distributionWeights).reduce((sum, weight) => sum + weight, 0);
  const remaining = total - mythic;
  const counts = Object.fromEntries(Object.entries(distributionWeights).map(([key, weight]) => [key, Math.round((remaining * weight) / weightSum)]));
  counts.bronze += remaining - Object.values(counts).reduce((sum, count) => sum + count, 0);
  counts.mythic = mythic;
  const tierCounts = Object.fromEntries(
    Object.entries(tierWeights).map(([key, weights]) => [key, weights.map((weight) => Math.round((remaining * weight) / weightSum))]),
  );
  tierCounts.mythic = [mythic];
  return { season: currentSeason.name, total, counts, tierCounts };
}
