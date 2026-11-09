import { el, replaceContent } from "../dom.js?v=25";
import { renderLayout } from "../layout.js?v=25";
import { createButton, createSectionHeading } from "../components.js?v=25";
import { createRankStatsSection } from "./rankStats.js?v=25";
import { rankTiers, unrealCap } from "../ranks.js?v=25";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const rankSteps = [
  ["Play ranked duels", "Win in Nodebuff, CrystalPvP or SpearMace to gain rating. Losses cost rating."],
  ["Climb the ladder", "Bronze to Diamond have three divisions each. Then Elite and Champion."],
  ["Reach Unreal", `The top rank is capped at ${unrealCap} players per gamemode. Hold your spot.`],
];

const ladderSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Ranked", title: "How ranks work", level: "h1" })),
    el(
      "div",
      { className: "rankLadderGraphic", ...reveal(60) },
      rankTiers.map((tier, index) =>
        el(
          "div",
          { className: `rankStep${tier.key === "unreal" ? " isUnreal" : ""}`, style: `--tierColor:${tier.color};--stepIndex:${index}` },
          el("span", { className: "rankStepBar" }, tier.divisions > 1 ? el("span", { className: "rankStepDivisions" }, "I · II · III") : null),
          el("span", { className: "rankStepName" }, tier.label),
          tier.key === "unreal" ? el("span", { className: "rankStepNote" }, `Top ${unrealCap}`) : null,
        ),
      ),
    ),
    el(
      "div",
      { className: "grid cols3" },
      rankSteps.map(([title, text], index) =>
        el(
          "div",
          { className: "card stepCard", ...reveal(index * 90) },
          el("span", { className: "stepNumber" }, `0${index + 1}`),
          el("h3", {}, title),
          el("p", { className: "cardText" }, text),
        ),
      ),
    ),
    el("p", { className: "rankNote" }, "Ranks are separate per gamemode. Thresholds are placeholders until launch."),
  ),
);


const leaderboardLink = el(
  "section",
  { className: "section compact" },
  el("div", { className: "container" }, createButton({ label: "View Unreal leaderboards", href: "leaderboards.html" })),
);

replaceContent(app, ladderSection, createRankStatsSection(), leaderboardLink);
