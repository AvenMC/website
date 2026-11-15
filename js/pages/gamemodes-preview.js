import { el, replaceContent } from "../dom.js?v=118";
import { gamemodes, ffaModes } from "../mockData.js?v=118";

const colors = {
  sword: "#3b82f6",
  crystalpvp: "#b89efa",
  mace: "#4dd4c4",
  fireball: "#ffa147",
  tntcart: "#f07878",
  uhc: "#f2c94c",
};

const descriptions = {
  sword: "Close-range combat with swords.",
  crystalpvp: "Place and detonate end crystals.",
  mace: "Mace combat with spear and elytra variants.",
  fireball: "Use fireballs for combat and movement.",
  tntcart: "Fight with explosive TNT minecarts.",
  uhc: "FinalUHC combat with golden apple healing.",
};

function modeCard(mode) {
  return el("li", { className: "showcaseMode", style: `--modeColor:${colors[mode.id]}` },
    el("span", { className: "showcaseModeMarker", "aria-hidden": "true" }),
    el("div", {},
      el("h3", {}, mode.name),
      el("p", {}, descriptions[mode.id]),
      mode.id === "mace" ? el("p", { className: "showcaseVariants" }, mode.variants.join(" / ")) : null,
    ),
  );
}

function modeSection(title, subtitle, modes, number) {
  return el("section", { className: "showcaseSection", "aria-label": `${title} gamemodes` },
    el("div", { className: "showcaseSectionHeading" },
      el("span", { className: "showcaseSectionNumber", "aria-hidden": "true" }, number),
      el("div", {}, el("h2", {}, title), el("p", {}, subtitle)),
      el("span", { className: "showcaseCount" }, `${modes.length} modes`),
    ),
    el("ul", { className: "showcaseModes" }, modes.map(modeCard)),
  );
}

replaceContent(document.getElementById("app"),
  el("header", { className: "showcaseHeader" },
    el("div", { className: "showcaseBrand" },
      el("img", { src: "assets/logoMark.png", alt: "", width: "64", height: "64" }),
      el("span", {}, "AVEN", el("span", {}, "MC")),
    ),
    el("p", { className: "showcaseEyebrow" }, "BEDROCK PRACTICE NETWORK"),
    el("h1", {}, "Gamemodes"),
  ),
  el("div", { className: "showcaseSections" },
    modeSection("FFA", "Free-for-all combat", ffaModes, "01"),
    modeSection("Duels", "Head-to-head combat", gamemodes, "02"),
  ),
  el("footer", { className: "showcaseFooter" },
    el("span", {}, "MINECRAFT BEDROCK"),
    el("span", {}, "GAMEMODE OVERVIEW"),
  ),
);
