import { el, replaceContent } from "../dom.js?v=50";
import { renderLayout } from "../layout.js?v=50";
import { createButton, createSectionHeading } from "../components.js?v=50";
import { createRankStatsSection } from "./rankStats.js?v=50";
import { rankTiers, rankedBoardSize } from "../ranks.js?v=50";
import { gamemodes } from "../mockData.js?v=50";
import { modeThemes } from "../modeTheme.js?v=50";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const rankSteps = [
  ["Play ranked duels", "Win duels to gain rating in each gamemode. Losses cost rating."],
  ["Climb the divisions", "Bronze, Silver and Gold each have three tiers (I–III). Above them waits Mythic."],
  ["Reach Mythic", `Mythic has no player limit. The top ${rankedBoardSize} Mythic players per gamemode make the leaderboard.`],
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
          tier.key === "mythic" ? el("span", { className: "rankStepNote" }, `Top ${rankedBoardSize} on the board`) : null,
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
  ["Bronze, Silver, Gold", "Progress in %", "Your progress through the current tier. Reach 100% to move up, and 100% in Gold III takes you into Mythic. These divisions have no leaderboard spot.", "var(--colorPrimary)"],
  ["Mythic", "Points", "Once you enter Mythic, percent is replaced by an open-ended point total that goes up with every win. No tiers, no player limit.", rankTiers[3].color],
  ["Leaderboards", `Top ${rankedBoardSize}`, `Only Mythic players are ranked. The top ${rankedBoardSize} by points per gamemode appear on the leaderboard.`, "var(--colorSuccess)"],
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
      gamemodes.map((mode) => {
        const button = createButton({ label: `${mode.name} top ${rankedBoardSize}`, variant: "secondary", href: `leaderboards.html?board=${mode.id}` });
        button.classList.add("modeButton");
        button.style.setProperty("--accent", modeThemes[mode.id].accent);
        return button;
      }),
    ),
  ),
);

replaceContent(app, ladderSection, scoreSection, createRankStatsSection(), leaderboardLink);
