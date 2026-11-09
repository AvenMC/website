/*
 * Mock data layer. Every value here is placeholder data generated locally.
 * Replace the exported async functions with real API calls once a backend exists;
 * the pages only depend on the shapes returned here.
 */

import { countries } from "./countries.js?v=28";
import { getRankedTier, unrealCap, unrealMinRating } from "./ranks.js?v=28";

export const gamemodes = [
  { id: "nodebuff", name: "Nodebuff", short: "NB", description: "Classic potion PvP." },
  { id: "crystalpvp", name: "CrystalPvP", short: "CP", description: "End crystal combat." },
  { id: "spearmace", name: "SpearMace", short: "SM", description: "Spear and mace duels." },
];

// Accounts, stats and leaderboards are shared across all regions.
export const regions = [
  { id: "eu", code: "EU", location: "Frankfurt", status: "Planned" },
  { id: "na", code: "NA", location: "New York", status: "Planned" },
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

const playerCount = 90;
const players = Array.from({ length: playerCount }, (_, index) => createPlayer(index));

// Unreal is limited to the top unrealCap players per gamemode.
const unrealHolders = Object.fromEntries(
  gamemodes.map((mode) => [
    mode.id,
    new Set(
      players
        .filter((player) => player.ratings[mode.id] >= unrealMinRating)
        .sort((a, b) => b.ratings[mode.id] - a.ratings[mode.id])
        .slice(0, unrealCap)
        .map((player) => player.username),
    ),
  ]),
);

export function getPlayerTier(player, modeId) {
  return getRankedTier(player.ratings[modeId], { isUnreal: unrealHolders[modeId].has(player.username) });
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

export async function getLeaderboard(categoryId) {
  await wait();
  const isRankedMode = gamemodes.some((mode) => mode.id === categoryId);
  // Ranked gamemode boards only list Unreal players.
  const source = isRankedMode ? players.filter((player) => unrealHolders[categoryId].has(player.username)) : players;

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

export async function getTopPlayersPreview() {
  const entries = await getLeaderboard("overall");
  return entries.slice(0, 3);
}

export const currentSeason = { name: "Season 1", isPlaceholder: true };

const distributionTotals = { nodebuff: { total: 4180, unreal: 50 }, crystalpvp: { total: 2760, unreal: 38 }, spearmace: { total: 1490, unreal: 21 } };
const distributionWeights = { bronze: 27, silver: 24, gold: 19, platinum: 13, diamond: 8, elite: 5, champion: 2 };

// Replace with the real season endpoint once it exists. Keep the returned shape.
export async function getRankDistribution(modeId) {
  await wait();
  const { total, unreal } = distributionTotals[modeId];
  const weightSum = Object.values(distributionWeights).reduce((sum, weight) => sum + weight, 0);
  const remaining = total - unreal;
  const counts = Object.fromEntries(Object.entries(distributionWeights).map(([key, weight]) => [key, Math.round((remaining * weight) / weightSum)]));
  counts.bronze += remaining - Object.values(counts).reduce((sum, count) => sum + count, 0);
  counts.unreal = unreal;
  return { season: currentSeason.name, total, unrealCap, counts };
}
