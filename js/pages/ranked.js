import { el, replaceContent } from "../dom.js?v=88";
import { initReveal } from "../effects.js?v=88";
import { renderLayout } from "../layout.js?v=88";
import { createButton, createRankedBadge, createSectionHeading } from "../components.js?v=88";
import { createRankStatsSection } from "./rankStats.js?v=88";
import { allRankTiers, rankTiers, rankedBoardSize } from "../ranks.js?v=88";
import { gamemodes } from "../mockData.js?v=88";
import { modeThemes } from "../modeTheme.js?v=88";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });
const format = (value) => value.toLocaleString("en-US");

const stepTexts = {
  bronze: "Start here. Win duels to fill the bar. At 100% you move up.",
  silver: "Same again: fill the bar to 100% to move up.",
  gold: "Fill the bar one last time to reach Mythic.",
};

function createDivisionCard(division, index) {
  const isMythic = division.key === "mythic";
  const badges = allRankTiers.filter((tier) => tier.key === division.key);
  return el(
    "li",
    { className: `divisionCard${isMythic ? " isMythic" : ""}`, "data-reveal": "", style: `--tierColor:${division.color}` },
    el("span", { className: "divisionStep" }, `Step ${index + 1}`),
    el("h3", {}, division.label),
    el("div", { className: "divisionBadges" }, badges.map((tier) => createRankedBadge(tier))),
    isMythic
      ? el("div", { className: "divisionDemo" }, el("strong", {}, "2,431 pts"), el("span", { className: "scoreRankChip" }, "#17"))
      : el("div", { className: "divisionDemo" }, el("div", { className: "ladderTrack isWide" }, el("span", { className: "ladderFill", style: "width:64%" })), el("small", {}, "0% → 100%")),
    el(
      "p",
      {},
      isMythic ? `No bar anymore. You collect points and get a place on the leaderboard. Top ${rankedBoardSize} are listed.` : stepTexts[division.key],
    ),
  );
}

const introSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el(
      "div",
      reveal(),
      createSectionHeading({ eyebrow: "Ranked", title: "From Bronze I to Mythic", description: "Win duels to fill your bar and rank up. Each of Bronze, Silver and Gold has three tiers (I, II, III). Mythic is the top.", level: "h1" }),
    ),
    el("div", { className: "divisionPanel", ...reveal(40) }, el("ol", { className: "divisionGrid" }, rankTiers.map((division, index) => createDivisionCard(division, index)))),
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

replaceContent(app, introSection, createRankStatsSection(), gainSection, leaderboardLink);
initReveal();
