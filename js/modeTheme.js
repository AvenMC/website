const modeIconUrls = {
  sword: "assets/icons/sword.png",
  crystalpvp: "assets/icons/crystal.png",
  mace: "assets/icons/mace.png",
  fireball: "assets/icons/fireball.png",
  tntcart: "assets/icons/tnt.png",
  uhc: "assets/icons/apple.png",
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
  `--iconUrl:url("${new URL(`../${modeIconUrls[modeId]}`, import.meta.url).href}");--iconFlip:1`;
