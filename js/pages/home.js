import { el, replaceContent } from "../dom.js?v=40";
import { renderLayout } from "../layout.js?v=40";
import {
  createAvatar,
  createBadge,
  createButton,
  createPlayerName,
  createSectionHeading,
  createSkeletonRows,
  createSocialLinks,
} from "../components.js?v=40";
import { createCopyField, openJoinModal } from "../join.js?v=40";
import { gamemodes, regions, getTopPlayersPreview } from "../mockData.js?v=40";
import { formatNumber } from "../format.js?v=40";
import { modeIcons, modeThemes } from "../modeTheme.js?v=40";
import { rankTiers, zenithCap } from "../ranks.js?v=40";
import { siteConfig } from "../siteConfig.js?v=40";

const app = renderLayout("home");
const reveal = (delay = 0) => ({ "data-reveal": "", style: `--revealDelay:${delay}ms` });

const hero = el(
  "section",
  { className: "hero" },
  el(
    "div",
    { className: "container heroGrid" },
    el(
      "div",
      { className: "heroContent" },
      createBadge({ label: "Bedrock Practice Network", variant: "primary" }),
      el("h1", {}, "Duel. ", el("span", { className: "accent" }, "Rank."), " Rise."),
      el("p", { className: "heroDescription" }, "Only 50 players per mode reach Zenith. One account, one ranking, every region."),
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
      el("div", { className: "heroSocials" }, createSocialLinks({ compact: true })),
    ),
    el(
      "div",
      { className: "heroVisual", "aria-hidden": "true" },
      el("span", { className: "heroGlow" }),
      el("img", { className: "heroLogo", src: "assets/logoMark.png", alt: "", width: "384", height: "384" }),
    ),
  ),
);

const tickerItems = ["Seasonal Divisions", "EU & NA Servers", "Unique Ranked Gamemode"];
const tickerGroup = () =>
  el("div", { className: "tickerGroup" }, Array.from({ length: 3 }, () => tickerItems).flat().map((item) => el("span", { className: "tickerItem" }, item)));
const ticker = el(
  "div",
  { className: "ticker", "aria-hidden": "true" },
  el("div", { className: "tickerTrack" }, tickerGroup(), tickerGroup()),
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
          el("span", { className: "modeIcon", style: `--iconUrl:url(../assets/modes/${modeIcons[mode.id]}.png)`, "aria-hidden": "true" }),
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
      el(
        "div",
        { className: "rankedTeaserText" },
        createBadge({ label: "Ranked", variant: "primary" }),
        el("h2", {}, `Only ${zenithCap} reach Zenith`),
        el("p", { className: "cardText" }, "Climb the divisions from Ripple to Zenith. A new season only drops you back one division, no full reset."),
        createButton({ label: "Explore Ranked", href: "ranked.html" }),
      ),
      el(
        "div",
        { className: "rankedTeaserTiers", "aria-hidden": "true" },
        rankTiers.map((tier) => el("span", { className: "rankedTeaserTier", style: `--tierColor:${tier.color}` }, tier.label)),
      ),
    ),
  ),
);

const stepsSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Get started", title: "Join in 30 seconds" })),
    el(
      "div",
      { className: "grid cols3" },
      [
        ["01", "Open Bedrock", "Launch Minecraft Bedrock Edition.", "var(--colorNodebuff)", "var(--colorNodebuffPanel)", "var(--colorNodebuffEdge)"],
        ["02", "Add server", `${siteConfig.serverIp} · port ${siteConfig.serverPort}`, "var(--colorPrimary)", "var(--colorSurface)", "var(--colorBorder)"],
        ["03", "Start dueling", "Queue up and climb the divisions.", "var(--colorMace)", "var(--colorMacePanel)", "var(--colorMaceEdge)"],
      ].map(([number, title, text, accent, panel, edge], index) =>
        el(
          "div",
          { className: "card stepCard", ...reveal(index * 90), style: `--revealDelay:${index * 90}ms;--accent:${accent};--panel:${panel};--edge:${edge}` },
          el("span", { className: "stepNumber" }, number),
          el("h3", {}, title),
          el("p", { className: "cardText" }, text),
        ),
      ),
    ),
    el("div", { className: "buttonRow sectionAction", ...reveal() }, createButton({ label: "Copy join details", onClick: openJoinModal })),
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

const finalCta = el(
  "section",
  { className: "section" },
  el(
    "div",
    { className: "container" },
    el(
      "div",
      { className: "finalCta", ...reveal() },
      el("h2", {}, "Ready to ", el("span", { className: "accent" }, "duel"), "?"),
      el("p", { className: "heroDescription" }, `${siteConfig.serverIp} · port ${siteConfig.serverPort}`),
      el("div", { className: "buttonRow" }, createButton({ label: "Copy join details", onClick: openJoinModal }), createButton({ label: "Join Discord", variant: "secondary", href: siteConfig.discordUrl })),
    ),
  ),
);

replaceContent(app, hero, ticker, gamemodesSection, featuresSection, rankedTeaser, stepsSection, rankingSection, regionsSection, communitySection, finalCta);

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

// Each home section gets its own accent so the page isn't one blue tone.
const sectionAccents = {
  gamemodes: "var(--colorNodebuff)",
  features: "var(--colorMace)",
  steps: "var(--colorNodebuff)",
  ranking: "var(--colorCrystal)",
  regions: "var(--colorSuccess)",
  community: "var(--colorCrystal)",
};
[
  [gamemodesSection, sectionAccents.gamemodes],
  [featuresSection, sectionAccents.features],
  [stepsSection, sectionAccents.steps],
  [rankingSection, sectionAccents.ranking],
  [regionsSection, sectionAccents.regions],
  [communitySection, sectionAccents.community],
].forEach(([section, accent]) => section.style.setProperty("--sectionAccent", accent));
