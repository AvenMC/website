const modeIconUrls = {
  sword: "assets/icons/sword.svg",
  crystalpvp: "https://img.icons8.com/fluency-systems-regular/96/diamond.png",
  mace: "https://img.icons8.com/material-outlined/96/hammer.png",
  fireball: "assets/icons/flame.svg",
  tntcart: "assets/icons/tntcart.svg",
  uhc: "assets/icons/uhc.svg",
};

export const modeThemes = {
  sword: { accent: "var(--colorSword)", panel: "var(--colorSwordPanel)", edge: "var(--colorSwordEdge)" },
  crystalpvp: { accent: "var(--colorCrystal)", panel: "var(--colorCrystalPanel)", edge: "var(--colorCrystalEdge)" },
  mace: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
  fireball: { accent: "var(--colorFireball)", panel: "var(--colorFireballPanel)", edge: "var(--colorFireballEdge)" },
  tntcart: { accent: "var(--colorTntCart)", panel: "var(--colorTntCartPanel)", edge: "var(--colorTntCartEdge)" },
  uhc: { accent: "var(--colorUhc)", panel: "var(--colorUhcPanel)", edge: "var(--colorUhcEdge)" },
};

export const modeIconStyle = (modeId) =>
  `--iconUrl:url("${modeIconUrls[modeId].startsWith("assets/") ? new URL(`../${modeIconUrls[modeId]}`, import.meta.url).href : modeIconUrls[modeId]}");--iconFlip:${modeId === "mace" ? "-1" : "1"}`;
