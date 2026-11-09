// AVENMC divisions. Zenith is capped: only the top zenithCap players above the rating threshold hold it.
export const zenithCap = 50;
export const zenithMinRating = 2200;

export const rankTiers = [
  { key: "ripple", label: "Ripple", color: "#4fd8e8", minRating: 0 },
  { key: "current", label: "Current", color: "#5b9cff", minRating: 900 },
  { key: "tempest", label: "Tempest", color: "#ff8a3d", minRating: 1700 },
  { key: "zenith", label: "Zenith", color: "#c56bff", minRating: zenithMinRating },
];

export function getRankedTier(rating, { isZenith = false } = {}) {
  if (isZenith && rating >= zenithMinRating) return { ...rankTiers[3], name: "Zenith" };
  const reached = rankTiers.slice(0, 3).filter((tier) => rating >= tier.minRating);
  const tier = reached[reached.length - 1] ?? rankTiers[0];
  return { ...tier, name: tier.label };
}
