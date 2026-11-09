import { el, replaceContent } from "../dom.js?v=47";
import { renderLayout } from "../layout.js?v=47";
import { createButton, createSectionHeading } from "../components.js?v=47";
import { createRankStatsSection } from "./rankStats.js?v=47";
import { rankTiers, mythicCap, rankedBoardSize } from "../ranks.js?v=47";
import { gamemodes } from "../mockData.js?v=47";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const rankSteps = [
  ["Play ranked duels", "Win duels to gain rating in each gamemode. Losses cost rating."],
  ["Climb the divisions", "Bronze, Silver and Gold each have three tiers (I–III). Above them waits Mythic."],
  ["Reach Mythic", `The top division is capped at ${mythicCap} players per gamemode. Hold your spot.`],
];

const ladderSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Ranked", title: "How Ranked works", level: "h1" })),
    el(
      "div",
      { className: "rankLadderGraphic", ...reveal(60) },
      rankTiers.map((tier, index) =>
        el(
          "div",
          { className: `rankStep${tier.key === "mythic" ? " isMythic" : ""}`, style: `--tierColor:${tier.color};--stepIndex:${index}` },
          el("span", { className: "rankStepBar" }, tier.tiers > 1 ? el("span", { className: "rankStepDivisions" }, "I · II · III") : null),
          el("span", { className: "rankStepName" }, tier.label),
          tier.key === "mythic" ? el("span", { className: "rankStepNote" }, `Top ${mythicCap}`) : null,
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
    el("p", { className: "rankNote" }, "New season: you only fall back a few tiers. Your rank is never fully reset."),
    el("p", { className: "rankNote" }, "Ranked is played in duels. The three FFA modes get duels too, and probably three more. Divisions are separate per gamemode. Thresholds are placeholders until launch."),
  ),
);

const scoreCards = [
  ["Bronze, Silver, Gold", "Progress in %", "Your progress through the current tier, from 0% to 99%. Reach 100% to move up to the next tier or division.", "var(--colorPrimary)"],
  ["Mythic", "Points", `Mythic has no tiers and no percent. You get an open-ended point total that keeps going up with every win. Only ${mythicCap} players hold Mythic per gamemode.`, rankTiers[3].color],
  ["Leaderboards", `Top ${rankedBoardSize}`, "Every ranked leaderboard shows the top 100 players of that gamemode. Mythic players show points, everyone else shows progress in %.", "var(--colorSuccess)"],
];

const scoreSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Scoring", title: "Points and progress" })),
    el(
      "div",
      { className: "grid cols3" },
      scoreCards.map(([label, value, text, accent], index) =>
        el(
          "div",
          { className: "card scoreCard", ...reveal(index * 90), style: `--accent:${accent};--revealDelay:${index * 90}ms` },
          el("span", { className: "scoreCardLabel" }, label),
          el("strong", { className: "scoreCardValue" }, value),
          el("p", { className: "cardText" }, text),
        ),
      ),
    ),
  ),
);

const leaderboardLink = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Leaderboards", title: "See who is on top" })),
    el(
      "div",
      { className: "buttonRow" },
      gamemodes.map((mode, index) => createButton({ label: `${mode.name} top ${rankedBoardSize}`, variant: index === 0 ? "primary" : "secondary", href: `leaderboards.html?board=${mode.id}` })),
    ),
  ),
);

replaceContent(app, ladderSection, scoreSection, createRankStatsSection(), leaderboardLink);
