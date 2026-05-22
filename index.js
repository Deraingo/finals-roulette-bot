import express from "express";
import { initDiscordBot } from "./src/bots/DiscordBot.js";
import { initTwitchBot } from "./src/bots/TwitchBot.js";
import { PORT, ENABLE_EVENTSUB_WEBHOOKS } from "./src/config/env.js";
import { getStreamerChannels } from "./src/db/queries.js";

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from ${req.ip}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Finals Roulette Bot is running!");
});


const streamers = await getStreamerChannels();
const channels = streamers.map(s => s.username);
const channelIds = streamers.map(s => s.user_id);

const twitchBot = await initTwitchBot({
  clientId: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  channels,
  channelIds,
  redemptionTitle: process.env.TWITCH_REDEMPTION_TITLE,
  expressApp: app,
  webhookSecret: process.env.TWITCH_WEBHOOK_SECRET,
});

app.listen(PORT, async () => {
  if (ENABLE_EVENTSUB_WEBHOOKS) {
    twitchBot.eventSub.markAsReady();
    await twitchBot.subscribe();
  } else {
    console.log("⚠️  EventSub webhooks disabled (dev) — chat only");
  }
});

initDiscordBot(process.env.DISCORD_TOKEN);