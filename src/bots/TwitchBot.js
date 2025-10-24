import { StaticAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { EventSubMiddleware } from "@twurple/eventsub-http";
import { ChatClient } from "@twurple/chat";
import { generateRandomLoadout } from "../data/loadoutGenerator.js";
import { formatForTwitch } from "../utils/formatters.js";

export async function initTwitchBot(config) {
  const {
    clientId,
    clientSecret,
    oauthToken,
    botUsername,
    channels,
    channelIds,
    redemptionTitle,
    expressApp,
    webhookSecret,
  } = config;

  // Remove 'oauth:' prefix if present
  const token = oauthToken.replace("oauth:", "");

  // Use StaticAuthProvider (doesn't require refresh token)
  const authProvider = new StaticAuthProvider(clientId, token, [
    "chat:read",
    "chat:edit",
    "channel:read:redemptions",
  ]);
  const apiClient = new ApiClient({ authProvider });

  // Create ChatClient for sending messages
  const chatClient = new ChatClient({
    authProvider,
    channels,
  });

  // Get the hostname for EventSub webhooks (without http://)
  const hostName = process.env.RENDER_EXTERNAL_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';

  // Create EventSub middleware for Express
  const eventSub = new EventSubMiddleware({
    apiClient,
    hostName,
    pathPrefix: "/eventsub",
    secret: webhookSecret,
  });

  // Apply EventSub middleware to Express app
  await eventSub.apply(expressApp);

  // Subscribe to channel point redemptions for each channel
  for (const [index, channelId] of channelIds.entries()) {
    await eventSub.onChannelRedemptionAdd(channelId, (event) => {
      if (event.rewardTitle === redemptionTitle) {
        const loadout = generateRandomLoadout();
        const loadoutString = formatForTwitch(loadout);
        const channelName = channels[index];
        chatClient.say(channelName, loadoutString);
      }
    });
  }

  await chatClient.connect();

  console.log(`✅ Twitch bot connected as ${botUsername}`);
  console.log(`📺 Listening to channels: ${channels.join(", ")}`);
  console.log(`🎯 Redemption trigger: "${redemptionTitle}"`);
  console.log(`🔗 EventSub webhooks ready at /eventsub`);
}
