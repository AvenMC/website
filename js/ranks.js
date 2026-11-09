// AVENMC divisions. The three lower divisions have tiers I-III. Zenith is capped: only the top zenithCap players above the rating threshold hold it.
export const zenithCap = 30;
export const zenithMinRating = 2200;

const tierStep = 240;
const romanNumerals = ["I", "II", "III"];

export const rankTiers = [
  { key: "ripple", label: "Ripple", color: "#4fd8e8", tiers: 3 },
  { key: "current", label: "Current", color: "#5b9cff", tiers: 3 },
  { key: "tempest", label: "Tempest", color: "#ff8a3d", tiers: 3 },
  { key: "zenith", label: "Zenith", color: "#c56bff", tiers: 1 },
];

export function getRankedTier(rating, { isZenith = false } = {}) {
  if (isZenith && rating >= zenithMinRating) return { ...rankTiers[3], tier: null, name: "Zenith" };
  const step = Math.floor(Math.max(0, rating) / tierStep);
  const division = rankTiers[Math.min(2, Math.floor(step / 3))];
  const tier = romanNumerals[Math.min(2, step % 3)];
  return { ...division, tier, name: `${division.label} ${tier}` };
}
