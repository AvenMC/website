export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatRatio(numerator, denominator) {
  return denominator === 0 ? numerator.toFixed(2) : (numerator / denominator).toFixed(2);
}

export function formatPercent(part, total) {
  return total === 0 ? "0%" : `${Math.round((part / total) * 100)}%`;
}

export function formatPlaytime(hours) {
  return `${formatNumber(hours)}h`;
}

export function formatDateTime(isoString) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(isoString),
  );
}
