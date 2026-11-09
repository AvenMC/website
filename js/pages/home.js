import { el, replaceContent } from "../dom.js";
import { renderLayout } from "../layout.js";
import {
  createAvatar,
  createBadge,
  createButton,
  createCard,
  createModal,
  createSectionHeading,
  createSkeleton,
} from "../components.js";
import { gamemodes, regions, getTopPlayersPreview } from "../mockData.js";
import { formatNumber } from "../format.js";

const app = renderLayout("home");

const joinModal = createModal({
  title: "Join AVENMC",
  body: [
    el("p", {}, "Server address and Bedrock connection details will be published here at launch."),
    createBadge({ label: "Placeholder", variant: "primary" }),
  ],
});

const previewList = el("div", { className: "stack" }, createSkeleton({ height: 52 }), createSkeleton({ height: 52 }), createSkeleton({ height: 52 }));

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
      el("h1", {}, "Competitive ", el("span", { className: "accent" }, "Bedrock PvP")),
      el("p", { className: "heroDescription" }, "A Practice Network built for ranked duels, FFA and a modern player experience."),
      el(
        "div",
        { className: "buttonRow" },
        createButton({ label: "How to join", onClick: () => joinModal.open() }),
        createButton({ label: "Leaderboards", variant: "secondary", href: "leaderboards.html" }),
      ),
    ),
    el(
      "div",
      { className: "card previewCard" },
      el(
        "div",
        { className: "previewHeader" },
        el("h3", {}, "Top players"),
        createBadge({ label: "Placeholder data" }),
      ),
      previewList,
    ),
  ),
);

const gamemodesSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    createSectionHeading({ eyebrow: "Gamemodes", title: "Choose your fight" }),
    el(
      "div",
      { className: "grid cols3" },
      gamemodes.map((mode) =>
        createCard({
          highlighted: false,
          children: el(
            "div",
            { className: "gamemodeCard" },
            el("span", { className: "gamemodeIcon", "aria-hidden": "true" }, mode.short),
            el("h3", {}, mode.name),
            el("p", { className: "cardText" }, mode.description),
            createBadge({ label: "Planned" }),
          ),
        }),
      ),
    ),
  ),
);

const regionsSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    createSectionHeading({ eyebrow: "Regions", title: "Play close to home" }),
    el(
      "div",
      { className: "grid cols3" },
      regions.map((region) =>
        el(
          "div",
          { className: `card regionCard${region.id === "as" ? " isMuted" : ""}` },
          el("div", {}, el("div", { className: "regionCode" }, region.code), el("div", { className: "regionLocation" }, region.location)),
          createBadge({ label: region.status }),
        ),
      ),
    ),
  ),
);

const featuresSection = el(
  "section",
  { className: "section compact" },
  el(
    "div",
    { className: "container" },
    createSectionHeading({ eyebrow: "Features", title: "Track your progress" }),
    el(
      "div",
      { className: "grid cols2" },
      createCard({ title: "Player Stats", text: "Ratings, duels, FFA and recent matches.", href: "profile.html" }),
      createCard({ title: "Leaderboards", text: "See who leads each gamemode.", href: "leaderboards.html" }),
    ),
  ),
);

replaceContent(app, hero, gamemodesSection, regionsSection, featuresSection);

getTopPlayersPreview().then((entries) => {
  replaceContent(
    previewList,
    entries.map((entry) =>
      el(
        "div",
        { className: "previewRow" },
        el("span", { className: "positionBadge" }, entry.position),
        createAvatar({ username: entry.username, skinUrl: entry.skinUrl }),
        el("strong", {}, entry.username),
        el("span", { className: "previewValue" }, formatNumber(entry.metric)),
      ),
    ),
  );
});
