// AVENMC divisions. The three lower divisions have tiers I-III. Mythic is capped: only the top mythicCap players above the rating threshold hold it.
export const mythicCap = 30;
export const mythicMinRating = 2200;
export const rankedBoardSize = 100;

const tierStep = 240;
const romanNumerals = ["I", "II", "III"];

export const rankTiers = [
  { key: "bronze", label: "Bronze", color: "#d98b52", tiers: 3 },
  { key: "silver", label: "Silver", color: "#c3cfdf", tiers: 3 },
  { key: "gold", label: "Gold", color: "#f2c94c", tiers: 3 },
  { key: "mythic", label: "Mythic", color: "#c56bff", tiers: 1 },
];

// Progress through the current tier in percent (0-99). Mythic has no tiers, it shows rating points instead.
export function getTierProgress(rating) {
  const step = Math.floor(Math.max(0, rating) / tierStep);
  if (step > 8) return 99;
  return Math.floor(((rating % tierStep) / tierStep) * 100);
}

export function getRankedTier(rating, { isMythic = false } = {}) {
  if (isMythic && rating >= mythicMinRating) return { ...rankTiers[3], tier: null, name: "Mythic" };
  const step = Math.min(8, Math.floor(Math.max(0, rating) / tierStep));
  const division = rankTiers[Math.min(2, Math.floor(step / 3))];
  const tier = romanNumerals[Math.min(2, step % 3)];
  return { ...division, tier, name: `${division.label} ${tier}` };
}
