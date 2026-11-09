export const modeIcons = { nodebuff: "flask", crystalpvp: "diamond", spearmace: "mace" };

export const modeThemes = {
  nodebuff: { accent: "var(--colorNodebuff)", panel: "var(--colorNodebuffPanel)", edge: "var(--colorNodebuffEdge)" },
  crystalpvp: { accent: "var(--colorCrystal)", panel: "var(--colorCrystalPanel)", edge: "var(--colorCrystalEdge)" },
  spearmace: { accent: "var(--colorMace)", panel: "var(--colorMacePanel)", edge: "var(--colorMaceEdge)" },
};

export const modeIconStyle = (modeId) => `--iconUrl:url(../assets/modes/${modeIcons[modeId]}.png)`;
