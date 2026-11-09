import { el } from "./dom.js";

const svgNs = "http://www.w3.org/2000/svg";

const palettes = {
  potion: { a: "#ffffff", b: "#f0556a", c: "#b82e48", d: "#6e1830", e: "#c9d6e8", f: "#8a6a4a", h: "#ffc4cf" },
  crystal: { a: "#ffffff", b: "#c46bff", c: "#8a3fd1", d: "#4a1f80", e: "#91a9c9", f: "#637b9c", h: "#e6c4ff" },
  mace: { a: "#ffffff", b: "#ffb347", c: "#c9751f", d: "#6b3a0e", e: "#91a9c9", f: "#637b9c", h: "#ffe0a8" },
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
    "................",
    "..........d.....",
    "....d..dhhhhd...",
    "...dhdhhbbbbbd..",
    "....dhbbbbbbbcd.",
    "...dhbbabbbbbcd.",
    "....hbbbbbbbccd.",
    "...dbbbbbbbccd..",
    "....dcbbbbccd...",
    ".....dccccdd....",
    "....ef.dd.d.....",
    "...ef...........",
    "..ef............",
    ".ef.............",
    "ff..............",
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
      rect.setAttribute("fill", palettes[name][char]);
      svg.append(rect);
    });
  });
  return el("span", { className: "pixelIcon" }, svg);
}
