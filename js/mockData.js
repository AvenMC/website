/*
 * Mock data layer. Every value here is placeholder data generated locally.
 * Replace the exported async functions with real API calls once a backend exists;
 * the pages only depend on the shapes returned here.
 */

export const gamemodes = [
  { id: "nodebuff", name: "Nodebuff", short: "NB", description: "Classic potion PvP." },
  { id: "crystalpvp", name: "CrystalPvP", short: "CP", description: "End crystal combat." },
  { id: "spearmace", name: "SpearMace", short: "SM", description: "Spear and mace duels." },
];

export const regions = [
  { id: "eu", code: "EU", location: "Frankfurt", status: "Planned" },
  { id: "na", code: "NA", location: "New York", status: "Planned" },
  { id: "as", code: "AS", location: "To be announced", status: "Potential" },
];

const mockDelayMs = 350;
const ranks = ["Member", "Member", "Member", "VIP", "VIP", "Elite"];
const tiers = [
  { min: 1800, name: "Master" },
  { min: 1600, name: "Diamond" },
  { min: 1400, name: "Platinum" },
  { min: 1200, name: "Gold" },
  { min: 1000, name: "Silver" },
  { min: 0, name: "Bronze" },
];

export function getTier(rating) {
  return tiers.find((tier) => rating >= tier.min).name;
}

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
    gamemodes.map((mode) => [mode.id, between(random, 900, 1950)]),
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
    regionOffset: { eu: 0, na: between(random, -120, 120) },
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
      opponent: `SamplePlayer${String(((index + matchIndex + 1) % 12) + 1).padStart(2, "0")}`,
      playedAt: new Date(baseTime - matchIndex * 47 * 60000).toISOString(),
    };
  });
}

const players = Array.from({ length: 12 }, (_, index) => createPlayer(index));

const wait = () => new Promise((resolve) => setTimeout(resolve, mockDelayMs));

export async function getPlayerNames() {
  await wait();
  return players.map((player) => player.username);
}

export async function getPlayer(username) {
  await wait();
  const query = (username ?? "").trim().toLowerCase();
  if (!query) return players[0];
  return players.find((player) => player.username.toLowerCase() === query) ?? null;
}

export const leaderboardCategories = [
  { id: "overall", label: "Overall", metricLabel: "Avg. Rating" },
  { id: "duels", label: "Duels", metricLabel: "Duel Wins" },
  { id: "ffa", label: "FFA", metricLabel: "Kills" },
  ...gamemodes.map((mode) => ({ id: mode.id, label: mode.name, metricLabel: "Rating" })),
];

function getMetric(player, categoryId, regionId) {
  const offset = player.regionOffset[regionId] ?? 0;
  if (categoryId === "overall") {
    const values = Object.values(player.ratings);
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) + offset;
  }
  if (categoryId === "duels") return Math.max(0, player.duels.wins + offset);
  if (categoryId === "ffa") return Math.max(0, player.ffa.kills + offset * 5);
  return player.ratings[categoryId] + offset;
}

export async function getLeaderboard(categoryId, regionId) {
  await wait();
  if (!(regionId in players[0].regionOffset)) return [];

  return players
    .map((player) => ({
      username: player.username,
      skinUrl: player.skinUrl,
      rank: player.rank,
      metric: getMetric(player, categoryId, regionId),
    }))
    .sort((a, b) => b.metric - a.metric)
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

export async function getTopPlayersPreview() {
  const entries = await getLeaderboard("overall", "eu");
  return entries.slice(0, 3);
}
