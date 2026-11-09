const modeIconUrls = {
  nodebuff: "../assets/modes/flask.svg",
  crystalpvp: "https://img.icons8.com/fluency-systems-regular/96/diamond.png",
  spearmace: "../assets/modes/hammer-outline.svg",
};

export const modeThemes = {
  nodebuff: { accent: "var(--colorNodebuff)", panel: "var(--colorNodebuffPanel)", edge: "var(--colorNodebuffEdge)" },
  crystalpvp: { accent: "var(--colorCrystal)", panel: "var(--colorCrystalPanel)", edge: "var(--colorCrystalEdge)" },
  spearmace: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
};

export const modeIconStyle = (modeId) =>
  `--iconUrl:url(${modeIconUrls[modeId]});--iconFlip:${modeId === "spearmace" ? "-1" : "1"}`;
