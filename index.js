import dotenv from "dotenv";
import express from "express";
import { initDiscordBot } from "./src/bots/DiscordBot.js";
import { initTwitchBot } from "./src/bots/TwitchBot.js";

dotenv.config();

// Create Express server for EventSub webhooks
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint (for Render)
app.get("/", (req, res) => {
  res.send("Finals Roulette Bot is running! 🎲");
});

// Start Discord bot
initDiscordBot(process.env.DISCORD_TOKEN);

// Start Twitch bot and pass the Express app for EventSub webhooks
const twitchBot = await initTwitchBot({
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  oauthToken: process.env.TWITCH_OAUTH_TOKEN,
  botUsername: process.env.TWITCH_BOT_USERNAME,
  botUserId: process.env.TWITCH_BOT_USER_ID,
  channels: process.env.TWITCH_CHANNELS.split(","),
  channelIds: process.env.TWITCH_CHANNEL_IDS.split(","),
  redemptionTitle: process.env.TWITCH_REDEMPTION_TITLE,
  expressApp: app, // Pass the Express app to TwitchBot
  webhookSecret: process.env.TWITCH_WEBHOOK_SECRET, // For EventSub verification
});

// Start the web server
app.listen(PORT, () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
});
