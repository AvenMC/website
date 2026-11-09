export const siteConfig = {
  serverIp: "avenmc.net",
  serverPort: 19132,
  playerHeadUrl: (username, size = 64) => `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size}`,
  discordUrl: "https://discord.gg/avenmc",
  socials: [
    { id: "discord", label: "Discord", handle: "discord.gg/avenmc", url: "https://discord.gg/avenmc" },
    { id: "tiktok", label: "TikTok", handle: "@AvenMC", url: "https://www.tiktok.com/@AvenMC" },
    { id: "youtube", label: "YouTube", handle: "@AvenMCnet", url: "https://www.youtube.com/@AvenMCnet" },
    { id: "instagram", label: "Instagram", handle: "@AvenMCnet", url: "https://www.instagram.com/AvenMCnet" },
  ],
};
