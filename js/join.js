import { el } from "./dom.js?v=50";
import { createButton, createModal, showToast } from "./components.js?v=50";
import { copyText } from "./effects.js?v=50";
import { siteConfig } from "./siteConfig.js?v=50";

export function createCopyField({ label, value }) {
  const button = createButton({
    label: "Copy",
    variant: "secondary",
    onClick: async () => {
      const copied = await copyText(value);
      showToast(copied ? `${label} copied: ${value}` : `Copy failed. ${label}: ${value}`);
    },
  });
  button.classList.add("buttonSmall");

  return el(
    "div",
    { className: "copyField" },
    el("div", { className: "copyFieldText" }, el("span", { className: "statLabel" }, label), el("strong", {}, value)),
    button,
  );
}

let joinModal;

export function openJoinModal() {
  joinModal ??= createModal({
    title: "Join AVENMC",
    body: [
      el(
        "ol",
        { className: "joinSteps" },
        el("li", {}, "Open Minecraft Bedrock Edition."),
        el("li", {}, "Go to Play → Servers → Add Server."),
        el("li", {}, "Enter the address and port below, then join."),
      ),
      createCopyField({ label: "Server address", value: siteConfig.serverIp }),
      createCopyField({ label: "Port", value: String(siteConfig.serverPort) }),
    ],
    actions: (close) => [
      createButton({ label: "Join Discord", variant: "secondary", href: siteConfig.discordUrl }),
      createButton({ label: "Done", onClick: close }),
    ],
  });
  joinModal.open();
}
