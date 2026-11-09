import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createButton,
  createPlayerName,
  createSectionHeading,
  createSkeleton,
  createSocialLinks,
} from "../components.js";
import { createCopyField, openJoinModal } from "../join.js";
import { gamemodes, regions, getTopPlayersPreview } from "../mockData.js";
import { formatNumber } from "../format.js";
import { createPixelIcon } from "../pixelIcons.js";
import { siteConfig } from "../siteConfig.js";

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
      createBadge({ label: "Minecraft Bedrock", variant: "primary" }),
      el("h1", {}, "Duel. ", el("span", { className: "accent" }, "Rank."), " Rise."),
      el("p", { className: "heroDescription" }, "The competitive Practice Network for Bedrock PvP."),
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

const tickerItems = [...gamemodes.map((mode) => mode.name), ...regions.slice(0, 2).map((region) => `${region.code} ${region.location}`), "Ranked Duels", "FFA"];
const tickerGroup = () =>
  el("div", { className: "tickerGroup" }, tickerItems.map((item) => el("span", { className: "tickerItem" }, item)));
const ticker = el(
  "div",
  { className: "ticker", "aria-hidden": "true" },
  el("div", { className: "tickerTrack" }, tickerGroup(), tickerGroup()),
);

const modeIcons = { nodebuff: "potion", crystalpvp: "crystal", spearmace: "mace" };
const modeAccents = { nodebuff: "var(--colorNodebuff)", crystalpvp: "var(--colorCrystal)", spearmace: "var(--colorMace)" };
const regionIcons = { eu: "europe", na: "northAmerica", as: "asia" };
const regionAccents = { eu: "var(--colorPrimary)", na: "var(--colorSuccess)", as: "var(--colorAsia)" };

const gamemodesSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    el("div", reveal(), createSectionHeading({ eyebrow: "Gamemodes", title: "Choose your fight" })),
    el(
      "div",
      { className: "grid cols3" },
      gamemodes.map((mode, index) =>
        el(
          "div",
          { className: "card hasSpotlight hasTilt gamemodeCard", ...reveal(index * 90), style: `--accent:${modeAccents[mode.id]};--revealDelay:${index * 90}ms` },
          createPixelIcon(modeIcons[mode.id], 72),
          el("h3", {}, mode.name),
          el("p", { className: "cardText" }, mode.description),
          createBadge({ label: "Planned" }),
        ),
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
        ["01", "Open Bedrock", "Launch Minecraft Bedrock Edition."],
        ["02", "Add server", `${siteConfig.serverIp} · port ${siteConfig.serverPort}`],
        ["03", "Start dueling", "Queue up and climb the ranks."],
      ].map(([number, title, text], index) =>
        el(
          "div",
          { className: "card stepCard", ...reveal(index * 90) },
          el("span", { className: "stepNumber" }, number),
          el("h3", {}, title),
          el("p", { className: "cardText" }, text),
        ),
      ),
    ),
    el("div", { className: "buttonRow sectionAction", ...reveal() }, createButton({ label: "Copy join details", onClick: openJoinModal })),
  ),
);

const previewList = el("div", { className: "stack" }, createSkeleton({ height: 56 }), createSkeleton({ height: 56 }), createSkeleton({ height: 56 }));

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
    el("div", reveal(), createSectionHeading({ eyebrow: "Regions", title: "Play close to home" })),
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
  ["Ranked duels", "Rating per gamemode and a competitive tier to climb.", "var(--colorPrimary)"],
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

replaceContent(app, hero, ticker, gamemodesSection, featuresSection, stepsSection, rankingSection, regionsSection, communitySection, finalCta);

getTopPlayersPreview().then((entries) => {
  replaceContent(
    previewList,
    entries.map((entry) =>
      el(
        "div",
        { className: "previewRow" },
        el("span", { className: "positionBadge" }, entry.position),
        createAvatar({ username: entry.username, skinUrl: entry.skinUrl }),
        createPlayerName(entry.username),
        el("span", { className: "previewValue" }, formatNumber(entry.metric)),
      ),
    ),
  );
});
