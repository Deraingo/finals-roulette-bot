import { Client, GatewayIntentBits } from "discord.js";
import { sendLoadout } from "../commands/roulette.js";
import { sendHelp } from "../commands/help.js";
export function initDiscordBot(discord_token) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith("!roulette")) {
      await sendLoadout(message);
    }
    if (message.content.startsWith("!help")) {
      await sendHelp(message);
    }
  });
  console.log("\n\n\nLoaded token:", discord_token ? "YES\n\n\n" : "NO\n\n\n");
  client.login(discord_token);
}
