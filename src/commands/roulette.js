import { generateRandomLoadout } from "../data/loadoutGenerator.js";
import { EmbedBuilder } from "discord.js";
import { formatForDiscord } from "../utils/formatters.js";

export async function sendLoadout(message) {
  const loadout = generateRandomLoadout();
  const embed = formatForDiscord(loadout);
  await message.reply({ embeds: [embed] });
}
