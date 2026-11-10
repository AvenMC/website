import { el, replaceContent } from "../dom.js?v=115";
import { renderLayout } from "../layout.js?v=115";
import {
  createAvatar,
  createBadge,
  createButton,
  createPlayerName,
  createRankedBadge,
  createSectionHeading,
  createSkeletonRows,
  createSocialLinks,
} from "../components.js?v=115";
import { createCopyField, openJoinModal } from "../join.js?v=115";
import { gamemodes, regions, getTopPlayersPreview } from "../mockData.js?v=115";
import { initSectionTone } from "../effects.js?v=115";
import { formatNumber } from "../format.js?v=115";
import { modeIconStyle, modeThemes } from "../modeTheme.js?v=115";
import { allRankTiers } from "../ranks.js?v=115";
import { siteConfig } from "../siteConfig.js?v=115";

const app = renderLayout("home");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const platforms = [["phone", "Mobile"], ["gamepad", "Console"], ["monitor", "PC"]];

// Placeholder until the server reports live numbers.
const onlinePlayers = 128;

const hero = el(
  "section",
  { className: "hero" },
  el(
    "div",
    { className: "container heroGrid" },
    el(
      "div",
      { className: "heroContent" },
      el("h1", {}, el("span", { className: "accent" }, "#1"), " Bedrock PvP Network"),
      el(
        "ul",
        { className: "platformRow", "aria-label": "Play on mobile, console and PC" },
        platforms.map(([icon, label]) =>
          el("li", {}, el("span", { className: "platformIcon", style: `--iconUrl:url(../assets/icons/${icon}.svg)`, "aria-hidden": "true" }), label),
        ),
      ),
      el(
        "p",
        { className: "onlineStatus" },
        el("span", { className: "onlineDot", "aria-hidden": "true" }),
        `${formatNumber(onlinePlayers)} players across ${regions.filter((region) => region.status === "At release").length} regions`,
      ),
      el(
        "div",
        { className: "ipPanel" },
        createCopyField({ label: "Server address", value: siteConfig.serverIp }),
        createCopyField({ label: "Port", value: String(siteConfig.serverPort) }),
      ),
      el(
        "div",
        { className: "buttonRow" },
        createButton({ label: "How to join", onClick: openJoinModal }),
        createButton({ label: "Join Discord", variant: "secondary", href: siteConfig.discordUrl }),
      ),
    ),
    el(
      "div",
      { className: "heroVisual", "aria-hidden": "true" },
      el("img", { className: "heroLogo", src: "assets/logoMark.png", alt: "", width: "384", height: "384" }),
    ),
  ),
);

const marqueeItems = ["NA and EU Region", "Ranked Duels", "Bedrock PvP"];
// Two identical halves wide enough to cover large screens, so the loop restarts seamlessly.
const marquee = el(
  "section",
  { className: "marquee", "aria-label": "Highlights" },
  el(
    "div",
    { className: "marqueeTrack", "aria-hidden": "true" },
    Array.from({ length: 8 }).flatMap(() => marqueeItems.map((text) => el("span", { className: "marqueeItem" }, text))),
  ),
  el("ul", { className: "srOnly" }, marqueeItems.map((text) => el("li", {}, text))),
);

const regionIcons = { eu: "europe", na: "northAmerica", as: "asia" };
const regionAccents = { eu: "var(--colorPrimary)", na: "var(--colorSuccess)", as: "var(--colorAsia)" };

const gamemodesSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "FFA Gamemodes", title: "Choose your fight" })),
    el(
      "div",
      { className: "grid cols3" },
      gamemodes.map((mode, index) =>
        el(
          "div",
          { className: "card hasSpotlight hasTilt gamemodeCard", ...reveal(index * 90), style: `--accent:${modeThemes[mode.id].accent};--panel:${modeThemes[mode.id].panel};--edge:${modeThemes[mode.id].edge};--revealDelay:${index * 90}ms` },
          el("span", { className: "modeIcon", style: modeIconStyle(mode.id), "aria-hidden": "true" }),
          el("h3", {}, mode.name),
          el("p", { className: "cardText" }, mode.description),
          createBadge({ label: "At release" }),
        ),
      ),
    ),
  ),
);

const rankedTeaser = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el(
      "div",
      { className: "card rankedTeaser", ...reveal() },
      createSectionHeading({ eyebrow: "Ranked", title: "Climb to the top" }),
      el("p", { className: "cardText" }, "Climb from Bronze to Mythic and fight for a spot on the leaderboard. A new season only drops you back a few tiers, no full reset."),
      el(
        "div",
        { className: "rankedTeaserTiers", role: "list", "aria-label": "Divisions" },
        allRankTiers.map((tier, index) => {
          const badge = createRankedBadge(tier);
          badge.classList.add("isLarge");
          badge.setAttribute("role", "listitem");
          badge.style.setProperty("--badgeDelay", `${index * 45}ms`);
          return badge;
        }),
      ),
      createButton({ label: "Explore Ranked", href: "ranked.html" }),
    ),
  ),
);

const previewList = createSkeletonRows(3);

const rankingSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container splitSection" },
    el(
      "div",
      { className: "stack", ...reveal() },
      createSectionHeading({ eyebrow: "Leaderboards", title: "Climb to the top" }),
      el("div", { className: "buttonRow" }, createButton({ label: "View leaderboards", href: "leaderboards.html" }), createButton({ label: "Player stats", variant: "secondary", href: "profile.html" })),
    ),
    el(
      "div",
      { className: "card previewCard", ...reveal(120) },
      el("div", { className: "previewHeader" }, el("h3", {}, "Top players"), createBadge({ label: "Placeholder data" })),
      previewList,
    ),
  ),
);

const regionsSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Regions", title: "Play close to home" }), el("p", { className: "regionNote" }, "One account across every region. Stats and leaderboards are shared.")),
    el(
      "div",
      { className: "grid cols3" },
      regions.map((region, index) =>
        el(
          "div",
          { className: `card regionCard${region.id === "as" ? " isMuted" : ""}`, ...reveal(index * 90), style: `--accent:${regionAccents[region.id]};--revealDelay:${index * 90}ms` },
          el("img", { className: "regionIcon", src: `assets/regions/${regionIcons[region.id]}.svg`, alt: "", width: "56", height: "56", loading: "lazy" }),
          el("div", { className: "regionText" }, el("div", { className: "regionCode" }, region.code), el("div", { className: "regionLocation" }, region.location)),
          createBadge({ label: region.status }),
        ),
      ),
    ),
  ),
);

const communitySection = el(
  "section",
  { className: "section" },
  el(
    "div",
    { className: "container" },
    el(
      "div",
      { className: "card isHighlighted communityCard", ...reveal() },
      el(
        "div",
        { className: "communityIntro" },
        createSectionHeading({ eyebrow: "Community", title: "Join the AVENMC community" }),
        el("div", { className: "buttonRow" }, createButton({ label: "Join Discord", href: siteConfig.discordUrl }), createButton({ label: "Play now", variant: "secondary", onClick: openJoinModal })),
      ),
      el("div", { className: "grid cols2 socialGrid" }, createSocialLinks()),
    ),
  ),
);

const features = [
  ["Ranked duels", "Duels with the same modes plus more. Rating and a division to climb.", "var(--colorPrimary)"],
  ["Free for all", "Drop in, fight, and build your kill streak.", "var(--colorDanger)"],
  ["Detailed stats", "K/D, win rate, streaks and recent matches at a glance.", "var(--colorSuccess)"],
  ["Bedrock native", "Join from mobile, console or PC.", "var(--colorMace)"],
];

const featuresSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Why AVENMC", title: "Built for competitive play" })),
    el(
      "div",
      { className: "grid cols4 featureGrid" },
      features.map(([title, text, accent], index) =>
        el("div", { className: "featureItem", ...reveal(index * 80), style: `--accent:${accent};--revealDelay:${index * 80}ms` }, el("h3", {}, title), el("p", { className: "cardText" }, text)),
      ),
    ),
  ),
);

replaceContent(app, hero, marquee, gamemodesSection, featuresSection, rankedTeaser, rankingSection, regionsSection, communitySection);

getTopPlayersPreview().then((entries) => {
  replaceContent(
    previewList,
    entries.map((entry) =>
      el(
        "div",
        { className: "previewRow" },
        el("span", { className: "positionBadge" }, entry.position),
        createAvatar({ username: entry.username, skinUrl: entry.skinUrl }),
        createPlayerName(entry.username, { country: entry.country }),
        el("span", { className: "previewValue" }, formatNumber(entry.metric)),
      ),
    ),
  );
});

// The backdrop color follows whichever section is crossing the middle of the screen.
const sectionTones = [
  [hero, "var(--colorPrimary)"],
  [gamemodesSection, "var(--colorNodebuff)"],
  [featuresSection, "var(--colorMace)"],
  [rankingSection, "var(--colorCrystal)"],
  [regionsSection, "var(--colorSuccess)"],
  [communitySection, "var(--colorPrimary)"],
];
initSectionTone(sectionTones);
