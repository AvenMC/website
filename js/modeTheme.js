const modeIconUrls = {
  sword: "assets/icons/sword.svg",
  crystalpvp: "https://img.icons8.com/fluency-systems-regular/96/diamond.png",
  mace: "https://img.icons8.com/material-outlined/96/hammer.png",
  fireball: "assets/icons/flame.svg",
  tntcart: "assets/icons/tntcart.svg",
  uhc: "assets/icons/uhc.svg",
};

export const modeThemes = {
  sword: { accent: "var(--colorNodebuff)", panel: "var(--colorNodebuffPanel)", edge: "var(--colorNodebuffEdge)" },
  crystalpvp: { accent: "var(--colorCrystal)", panel: "var(--colorCrystalPanel)", edge: "var(--colorCrystalEdge)" },
  mace: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
  fireball: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
  tntcart: { accent: "var(--colorDanger)", panel: "var(--colorCard)", edge: "var(--colorBorder)" },
  uhc: { accent: "var(--colorSuccess)", panel: "var(--colorNodebuffPanel)", edge: "var(--colorNodebuffEdge)" },
};

export const modeIconStyle = (modeId) =>
  `--iconUrl:url(${modeIconUrls[modeId].startsWith("assets/") ? `../${modeIconUrls[modeId]}` : modeIconUrls[modeId]});--iconFlip:${modeId === "mace" ? "-1" : "1"}`;
