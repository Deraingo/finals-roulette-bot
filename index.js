import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { sendLoadout } from "./src/commands/roulette.js";
import { sendHelp } from "./src/commands/help";

dotenv.config();
console.log("\n\n\nLoaded token:", process.env.DISCORD_TOKEN ? "YES\n\n\n" : "NO\n\n\n");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("!roulette")) {
    await sendLoadout(message);
  }
  if(message.content.startsWith("!help")){
    await sendHelp(message);
  }
});

client.login(process.env.DISCORD_TOKEN);