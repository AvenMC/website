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

function createDivisionCard(division) {
  const isMythic = division.key === "mythic";
  const badges = allRankTiers.filter((tier) => tier.key === division.key);
  return el(
    "li",
    { className: `divisionCard${isMythic ? " isMythic" : ""}`, "data-reveal": "", style: `--tierColor:${division.color}` },
    el("h3", {}, division.label),
    el("div", { className: "divisionBadges" }, badges.map((tier) => createRankedBadge(tier))),
    el("p", {}, isMythic ? `Points instead of a bar, no cap. Top ${rankedBoardSize} on the leaderboard.` : null),
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
      createSectionHeading({ eyebrow: "Ranked", title: "Ten ranks. One goal.", description: "Win duels to fill your bar from 0 to 100% and reach the next tier.", level: "h1" }),
    ),
    el("div", { className: "divisionPanel", ...reveal(40) }, el("ol", { className: "divisionGrid" }, rankTiers.map((division) => createDivisionCard(division)))),
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
