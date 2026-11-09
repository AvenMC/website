import { el, replaceContent } from "../dom.js?v=76";
import { initReveal } from "../effects.js?v=76";
import { renderLayout } from "../layout.js?v=76";
import { createButton, createRankedBadge, createSectionHeading } from "../components.js?v=76";
import { createRankStatsSection } from "./rankStats.js?v=76";
import { allRankTiers, mythicMinRating, rankedBoardSize, tierStep } from "../ranks.js?v=76";
import { gamemodes } from "../mockData.js?v=76";
import { modeThemes } from "../modeTheme.js?v=76";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });
const format = (value) => value.toLocaleString("en-US");

const flowSteps = ["Win duels", "Fill your percent bar", "Rank up", "Reach Mythic"];

// Rating range of one tier, derived from the same step the scoring uses.
function tierRange(index, tier) {
  if (tier.key === "mythic") return `${format(mythicMinRating)}+`;
  return `${format(Math.round(index * tierStep))} – ${format(Math.round((index + 1) * tierStep) - 1)}`;
}

function createLadderRow(tier, index) {
  const isMythic = tier.key === "mythic";
  return el(
    "li",
    { className: `ladderRow${isMythic ? " isMythic" : ""}`, style: `--tierColor:${tier.color};--step:${index};--revealDelay:${(allRankTiers.length - index) * 50}ms`, "data-reveal": "" },
    el("span", { className: "ladderBadge" }, createRankedBadge(tier)),
    el("span", { className: "ladderElo" }, el("strong", {}, tierRange(index, tier)), el("small", {}, isMythic ? "Points" : "Elo")),
    isMythic
      ? el("span", { className: "ladderProgress isOpen" }, el("span", { className: "ladderOpenText" }, `No limit · top ${rankedBoardSize} on the leaderboard`))
      : el("span", { className: "ladderProgress" }, el("span", { className: "ladderTrack" }, el("span", { className: "ladderFill" })), el("span", { className: "ladderPercent" }, "0% → 100%")),
  );
}

const ladderSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el(
      "div",
      reveal(),
      createSectionHeading({ eyebrow: "Ranked", title: "Ten ranks. One goal.", description: "Win duels, fill your bar and climb from Bronze I to Mythic.", level: "h1" }),
    ),
    el(
      "ol",
      { className: "flowSteps", ...reveal(40) },
      flowSteps.map((step, index) => el("li", {}, el("span", { className: "flowNumber" }, index + 1), step)),
    ),
    el("ol", { className: "rankLadder" }, allRankTiers.map((tier, index) => createLadderRow(tier, index)).reverse()),
    el("p", { className: "placeholderNote", ...reveal() }, "Elo ranges are placeholders until launch."),
  ),
);

const silver = allRankTiers[4];
const mythic = allRankTiers[9];

const scoreSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Scoring", title: "Percent first, then points" })),
    el(
      "div",
      { className: "scoreSplit", ...reveal(60) },
      el(
        "div",
        { className: "scoreSide", style: `--tierColor:${silver.color}` },
        el("span", { className: "scoreSideLabel" }, "Bronze · Silver · Gold"),
        el("div", { className: "scoreDemo" }, createRankedBadge(silver), el("strong", {}, "64%")),
        el("div", { className: "ladderTrack isWide" }, el("span", { className: "ladderFill", style: "width:64%" })),
        el("p", { className: "cardText" }, "Reach 100% to move up a tier."),
      ),
      el("span", { className: "scoreArrow", "aria-hidden": "true" }, "→"),
      el(
        "div",
        { className: "scoreSide", style: `--tierColor:${mythic.color}` },
        el("span", { className: "scoreSideLabel" }, "Mythic"),
        el("div", { className: "scoreDemo" }, createRankedBadge(mythic), el("strong", {}, "2,431 pts")),
        el("div", { className: "scoreRankChip" }, "#17 on the leaderboard"),
        el("p", { className: "cardText" }, `Points have no cap. Top ${rankedBoardSize} are listed.`),
      ),
    ),
  ),
);

const gainRows = [
  ["Speed", "Faster wins earn more", "var(--colorNodebuff)", el("span", { className: "gainMeter" }, el("span", { style: "width:85%" }))],
  ["HP lost", "More health left, more reward", "var(--colorDanger)", el("span", { className: "gainHearts" }, "♥♥♥♥♥♥♥♡♡♡")],
  [
    "Opponent",
    "Beat a higher division for more, a lower one for less",
    "var(--colorMace)",
    el("span", { className: "gainVersus" }, createRankedBadge(allRankTiers[2]), el("b", {}, "▲"), createRankedBadge(allRankTiers[5])),
  ],
];

const gainSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Gains", title: "What a win is worth" })),
    el(
      "ul",
      { className: "gainList", ...reveal(60) },
      gainRows.map(([label, text, accent, visual]) =>
        el("li", { style: `--accent:${accent}` }, el("strong", {}, label), el("span", { className: "gainText" }, text), visual),
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

replaceContent(app, ladderSection, scoreSection, createRankStatsSection(), gainSection, leaderboardLink);
initReveal();
