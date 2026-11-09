// AVENMC divisions. Unreal is capped: only the top unrealCap players above the rating threshold hold it.
export const unrealCap = 50;
export const unrealMinRating = 2200;

export const rankTiers = [
  { key: "bronze", label: "Bronze", color: "#d98b52", minRating: 0 },
  { key: "silver", label: "Silver", color: "#c3cfdf", minRating: 900 },
  { key: "gold", label: "Gold", color: "#f2c94c", minRating: 1700 },
  { key: "unreal", label: "Unreal", color: "#c56bff", minRating: unrealMinRating },
];

export function getRankedTier(rating, { isUnreal = false } = {}) {
  if (isUnreal && rating >= unrealMinRating) return { ...rankTiers[3], name: "Unreal" };
  const reached = rankTiers.slice(0, 3).filter((tier) => rating >= tier.minRating);
  const tier = reached[reached.length - 1] ?? rankTiers[0];
  return { ...tier, name: tier.label };
}
