import { el, replaceContent } from "../dom.js?v=96";
import { initReveal } from "../effects.js?v=96";
import { renderLayout } from "../layout.js?v=96";
import { createButton, createRankedBadge, createSectionHeading } from "../components.js?v=96";
import { createRankStatsSection } from "./rankStats.js?v=96";
import { allRankTiers, rankTiers } from "../ranks.js?v=96";
import { gamemodes } from "../mockData.js?v=96";
import { modeThemes } from "../modeTheme.js?v=96";

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
    isMythic
      ? el("div", { className: "divisionDemo" }, el("strong", {}, "2,431 pts"), el("span", { className: "scoreRankChip" }, "#17 on the leaderboard"))
      : el("div", { className: "divisionDemo" }, el("div", { className: "ladderTrack isWide" }, el("span", { className: "ladderFill", style: "width:64%" })), el("small", {}, "64% · at 100% you reach the next tier")),
    isMythic ? el("p", {}, "Points instead of a bar, no cap. Every Mythic player gets a leaderboard place.") : null,
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
      createSectionHeading({ eyebrow: "Ranked", title: "Rank progression", description: "Win duels to fill your bar from 0 to 100% and reach the next tier.", level: "h1" }),
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
    el("div", reveal(), createSectionHeading({ eyebrow: "Gains", title: "Factors affecting rank progress" })),
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
    el("div", reveal(), createSectionHeading({ eyebrow: "Leaderboards", title: "Ranked leaderboards" })),
    el(
      "div",
      { className: "buttonRow" },
      gamemodes.map((mode) => {
        const button = createButton({ label: `${mode.name} leaderboard`, variant: "secondary", href: `leaderboards.html?board=${mode.id}` });
        button.classList.add("modeButton");
        button.style.setProperty("--accent", modeThemes[mode.id].accent);
        return button;
      }),
    ),
  ),
);

replaceContent(app, introSection, createRankStatsSection(), gainSection, leaderboardLink);
initReveal();
