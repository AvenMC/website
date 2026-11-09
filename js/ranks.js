// Fortnite-style ranked ladder. Unreal is capped: only the top unrealCap players above the rating threshold hold it.
export const unrealCap = 50;
export const unrealMinRating = 2200;

const divisionStep = 120;
const romanNumerals = ["I", "II", "III"];

export const rankTiers = [
  { key: "bronze", label: "Bronze", color: "#d98b52", divisions: 3 },
  { key: "silver", label: "Silver", color: "#c3cfdf", divisions: 3 },
  { key: "gold", label: "Gold", color: "#f2c94c", divisions: 3 },
  { key: "platinum", label: "Platinum", color: "#4fd8e8", divisions: 3 },
  { key: "diamond", label: "Diamond", color: "#5b9cff", divisions: 3 },
  { key: "elite", label: "Elite", color: "#9aa7bd", divisions: 1 },
  { key: "champion", label: "Champion", color: "#ff8a3d", divisions: 1 },
  { key: "unreal", label: "Unreal", color: "#c56bff", divisions: 1 },
];

const eliteMinRating = 3 * 5 * divisionStep;
const championMinRating = eliteMinRating + 200;

export function getRankedTier(rating, { isUnreal = false } = {}) {
  if (isUnreal && rating >= unrealMinRating) return { ...rankTiers[7], division: null, name: "Unreal" };
  if (rating >= championMinRating) return { ...rankTiers[6], division: null, name: "Champion" };
  if (rating >= eliteMinRating) return { ...rankTiers[5], division: null, name: "Elite" };

  const step = Math.floor(Math.max(0, rating) / divisionStep);
  const tier = rankTiers[Math.min(4, Math.floor(step / 3))];
  const division = romanNumerals[Math.min(2, step % 3)];
  return { ...tier, division, name: `${tier.label} ${division}` };
}
