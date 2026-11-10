// AVENMC divisions. The three lower divisions have tiers I-III. Mythic has no player limit,
// but only the top rankedBoardSize Mythic players appear on the leaderboard.
export const mythicMinRating = 900;
export const rankedBoardSize = 50;

// Nine tiers of 100 points fill exactly up to mythicMinRating, matching the backend (100 points = 100% of a tier).
export const tierStep = mythicMinRating / 9;
const romanNumerals = ["I", "II", "III"];

export const rankTiers = [
  { key: "bronze", label: "Bronze", color: "#d98b52", tiers: 3 },
  { key: "silver", label: "Silver", color: "#c3cfdf", tiers: 3 },
  { key: "gold", label: "Gold", color: "#f2c94c", tiers: 3 },
  { key: "mythic", label: "Mythic", color: "#c56bff", tiers: 1 },
];

// Every tier as a badge object (Bronze I ... Gold III, Mythic), in climbing order.
export const allRankTiers = rankTiers.flatMap((division) =>
  division.tiers === 1
    ? [{ ...division, tier: null, name: division.label }]
    : romanNumerals.map((tier) => ({ ...division, tier, name: `${division.label} ${tier}` })),
);

// In-game ranks shown next to player names. Members get no badge.
export const memberRankColors = { VIP: "#39d69a", Elite: "#ffa147" };

// Progress through the current tier in percent (0-99). Mythic has no tiers, it shows rating points instead.
export function getTierProgress(rating) {
  const step = Math.floor(Math.max(0, rating) / tierStep);
  return Math.floor(((rating % tierStep) / tierStep) * 100);
}

// Mythic shows open-ended rating points, every other division shows tier progress in percent.
export function getTierScore(rating, tier) {
  return tier.key === "mythic"
    ? { label: "Points", text: rating.toLocaleString("en-US") }
    : { label: "Progress", text: `${getTierProgress(rating)}%` };
}

export function getRankedTier(rating) {
  if (rating >= mythicMinRating) return { ...rankTiers[3], tier: null, name: "Mythic" };
  const step = Math.min(8, Math.floor(Math.max(0, rating) / tierStep));
  const division = rankTiers[Math.min(2, Math.floor(step / 3))];
  const tier = romanNumerals[Math.min(2, step % 3)];
  return { ...division, tier, name: `${division.label} ${tier}` };
}
