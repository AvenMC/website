const modeIconUrls = {
  nodebuff: "https://img.icons8.com/material-rounded/96/flask.png",
  crystalpvp: "https://img.icons8.com/fluency-systems-regular/96/diamond.png",
  spearmace: "https://img.icons8.com/material-rounded/96/hammer.png",
};

export const modeThemes = {
  nodebuff: { accent: "var(--colorNodebuff)", panel: "var(--colorNodebuffPanel)", edge: "var(--colorNodebuffEdge)" },
  crystalpvp: { accent: "var(--colorCrystal)", panel: "var(--colorCrystalPanel)", edge: "var(--colorCrystalEdge)" },
  spearmace: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
};

export const modeIconStyle = (modeId) =>
  `--iconUrl:url(${modeIconUrls[modeId]});--iconFlip:${modeId === "spearmace" ? "-1" : "1"}`;
