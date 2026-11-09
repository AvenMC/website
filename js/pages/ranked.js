import { el, replaceContent } from "../dom.js?v=56";
import { initReveal } from "../effects.js?v=56";
import { renderLayout } from "../layout.js?v=56";
import { createButton, createSectionHeading, createTabs } from "../components.js?v=56";
import { createRankStatsSection } from "./rankStats.js?v=56";
import { rankTiers, rankedBoardSize } from "../ranks.js?v=56";
import { gamemodes, getRankDistribution } from "../mockData.js?v=56";
import { modeThemes } from "../modeTheme.js?v=56";

const app = renderLayout("ranked");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const { total: ladderTotal, tierCounts } = await getRankDistribution("nodebuff");
const ladderMax = Math.max(...Object.values(tierCounts).flat());
const formatShare = (count) => {
  const share = (count / ladderTotal) * 100;
  return `${share >= 10 ? share.toFixed(0) : share.toFixed(1)}%`;
};

const rankSteps = [
  ["Play ranked duels", "Win duels to gain percent or points in each gamemode. Losses cost some of it."],
  ["Climb the divisions", "Bronze, Silver and Gold each have three tiers (I–III). Above them waits Mythic."],
  ["Reach Mythic", `Mythic has no player limit. The top ${rankedBoardSize} Mythic players per gamemode make the leaderboard.`],
];

const ladderColumns = (view) =>
  rankTiers.flatMap((tier) => {
    const counts = tierCounts[tier.key];
    if (view === "simplified" || tier.tiers === 1) {
      return [{ label: tier.label, color: tier.color, count: counts.reduce((sum, count) => sum + count, 0), mythic: tier.key === "mythic" }];
    }
    return counts.map((count, index) => ({ label: `${tier.label} ${index + 1}`, color: tier.color, count }));
  });

const ladderGraphic = el("div", { className: "rankLadderGraphic", ...reveal(60) });

function renderLadder(view) {
  const columns = ladderColumns(view);
  const max = Math.max(...columns.map((column) => column.count));
  ladderGraphic.dataset.view = view;
  ladderGraphic.replaceChildren(
    ...columns.map((column) =>
      el(
        "div",
        { className: `rankStepColumn${column.mythic ? " isMythic" : ""}`, style: `--tierColor:${column.color}`, title: `${column.label}: ${column.count.toLocaleString("en-US")} players` },
        el("span", { className: "rankStepShare" }, formatShare(column.count)),
        el("span", { className: "rankStepBar", style: `height:${Math.max(6, (column.count / max) * 100)}%` }),
        el("span", { className: "rankStepName" }, column.label),
        column.mythic ? el("span", { className: "rankStepNote" }, `Top ${rankedBoardSize}`) : null,
      ),
    ),
  );
}

const ladderToggle = createTabs({
  label: "Ladder view",
  active: "complex",
  tabs: [
    { id: "simplified", label: "Simplified" },
    { id: "complex", label: "Complex" },
  ],
  onChange: renderLadder,
});

renderLadder("complex");

const ladderSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Ranked", title: "How Ranked works", level: "h1" })),
    el("div", { className: "rankLadderToolbar", ...reveal(30) }, ladderToggle),
    ladderGraphic,
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

const gainFactors = [
  ["Speed", "Faster wins", "The quicker you close out a duel, the more you earn.", "var(--colorNodebuff)"],
  ["Health", "HP lost", "Winning with more health left is worth more than a close fight.", "var(--colorDanger)"],
  ["Opponent", "Division gap", "Beating someone in a higher division earns more. If you are the higher division, you get less.", "var(--colorMace)"],
];

const gainSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Gains", title: "What decides your percent and points" })),
    el(
      "div",
      { className: "grid cols3" },
      gainFactors.map(([label, value, text, accent], index) =>
        el(
          "div",
          { className: "card scoreCard", ...reveal(index * 90), style: `--accent:${accent};--revealDelay:${index * 90}ms` },
          el("span", { className: "scoreCardLabel" }, label),
          el("strong", { className: "scoreCardValue" }, value),
          el("p", { className: "cardText" }, text),
        ),
      ),
    ),
    el("p", { className: "rankNote" }, "This applies to both percent in Bronze, Silver and Gold and points in Mythic. Exact values are tuned before launch."),
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

replaceContent(app, ladderSection, scoreSection, gainSection, createRankStatsSection(), leaderboardLink);
initReveal();
