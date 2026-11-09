import { el } from "./dom.js?v=88";
import { createAvatar, createFlag, createRankedBadge } from "./components.js?v=88";
import { getPlayerPreview } from "./mockData.js?v=88";
import { modeIconStyle, modeThemes } from "./modeTheme.js?v=88";
import { getTierScore, memberRankColors } from "./ranks.js?v=88";
import { formatNumber, formatPlaytime } from "./format.js?v=88";

const showDelayMs = 220;
const hideDelayMs = 80;
const gap = 10;

let card = null;
let showTimer;
let hideTimer;
let activeTrigger = null;

function formatJoined(iso) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(iso));
}

function createCard(player) {
  const rankColor = memberRankColors[player.rank];
  return [
    el(
      "div",
      { className: "previewHead" },
      createAvatar({ username: player.username }),
      el(
        "div",
        { className: "previewWho" },
        el("span", { className: "previewName" }, player.country ? createFlag(player.country) : null, el("span", { className: "playerName" }, player.username)),
        el("span", { className: "previewSince" }, `Playing since ${formatJoined(player.joinedAt)}`),
      ),
      rankColor ? createRankedBadge({ key: "rank", color: rankColor, name: player.rank }) : null,
    ),
    el(
      "dl",
      { className: "previewStats" },
      [
        ["Level", player.level],
        ["Playtime", formatPlaytime(player.playtimeHours)],
        ["Duel W/L", `${formatNumber(player.wins)}/${formatNumber(player.losses)}`],
      ].map(([label, value]) => el("div", {}, el("dt", {}, label), el("dd", {}, value))),
    ),
    el(
      "ul",
      { className: "previewRanked" },
      player.ranked.map((mode) =>
        el(
          "li",
          { style: `--accent:${modeThemes[mode.id].accent}` },
          el("span", { className: "modeIcon small", style: modeIconStyle(mode.id), "aria-hidden": "true" }),
          el("span", { className: "previewMode" }, mode.name),
          el("span", { className: "previewScore" }, getTierScore(mode.rating, mode.tier).text + (mode.position ? ` · #${mode.position}` : "")),
          createRankedBadge(mode.tier),
        ),
      ),
    ),
  ];
}

function position(trigger) {
  const rect = trigger.getBoundingClientRect();
  const width = card.offsetWidth;
  const height = card.offsetHeight;
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
  const fitsBelow = rect.bottom + gap + height < window.innerHeight - 8;
  card.style.left = `${left}px`;
  card.style.top = `${fitsBelow ? rect.bottom + gap : Math.max(8, rect.top - gap - height)}px`;
}

async function show(trigger, username) {
  const player = await getPlayerPreview(username);
  if (!player || activeTrigger !== trigger) return;
  card ??= el("div", { className: "playerPreview", role: "tooltip" });
  card.replaceChildren(...createCard(player));
  card.classList.remove("isOpen");
  if (!card.isConnected) document.body.append(card);
  position(trigger);
  requestAnimationFrame(() => card.classList.add("isOpen"));
}

function hide() {
  clearTimeout(showTimer);
  activeTrigger = null;
  card?.classList.remove("isOpen");
}

// Shows a small profile card while the pointer or keyboard focus is on the player name.
export function attachPlayerPreview(trigger, username) {
  const open = () => {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    activeTrigger = trigger;
    showTimer = setTimeout(() => show(trigger, username), showDelayMs);
  };
  const close = () => {
    clearTimeout(showTimer);
    hideTimer = setTimeout(hide, hideDelayMs);
  };
  trigger.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && open());
  trigger.addEventListener("pointerleave", close);
  trigger.addEventListener("focusin", open);
  trigger.addEventListener("focusout", close);
  return trigger;
}

window.addEventListener("scroll", hide, { passive: true });
document.addEventListener("click", hide);
