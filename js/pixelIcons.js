import { el } from "./dom.js";

const svgNs = "http://www.w3.org/2000/svg";

const palette = {
  a: "#ffffff",
  b: "#28b9f5",
  c: "#2479c9",
  d: "#0f3a66",
  e: "#91a9c9",
  f: "#637b9c",
  g: "#39d69a",
  h: "#c8e9fb",
};

// 16x16 pixel sprites, one character per pixel, "." is transparent.
const sprites = {
  potion: [
    "................",
    "......ffff......",
    "......ehhe......",
    ".......ee.......",
    ".......ee.......",
    "......eaae......",
    ".....eahhae.....",
    "....ebbbbbbe....",
    "...ebbhbbbbbe...",
    "...ebhbbbbbbe...",
    "...ebbbbbbcce...",
    "...ebbbbbcccce..",
    "...ecbbbcccce...",
    "....eccccccde...",
    ".....edddde.....",
    "................",
  ],
  crystal: [
    "................",
    ".......aa.......",
    "......ahba......",
    ".....ahbbca.....",
    "....ahbbbbca....",
    "...ahbbbbbbca...",
    "..ahbbbbbbbbca..",
    "...ahbbaabbca...",
    "....abbaabbca...",
    ".....abbbbca....",
    "......abbca.....",
    ".......acd......",
    "........d.......",
    "................",
    "................",
    "................",
  ],
  mace: [
    ".............ff.",
    "............feef",
    "..........hhaeef",
    "........hhbbaef.",
    ".......hbbbbhf..",
    "......hbbbbbf...",
    ".....hbbbbcd....",
    "....hbbbbcd.....",
    "...ecbbcd.......",
    "..ecfccd........",
    ".ecf.dd.........",
    "ecf.............",
    "ff..............",
    "................",
    "................",
    "................",
  ],
};

export function createPixelIcon(name, size = 64) {
  const rows = sprites[name];
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute("aria-hidden", "true");
  rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === ".") return;
      const rect = document.createElementNS(svgNs, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", 1);
      rect.setAttribute("height", 1);
      rect.setAttribute("fill", palette[char]);
      svg.append(rect);
    });
  });
  return el("span", { className: "pixelIcon" }, svg);
}
