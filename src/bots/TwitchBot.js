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

  console.log(`🔍 EventSub Config:`);
  console.log(`   Hostname: ${hostName}`);
  console.log(`   Webhook URL: https://${hostName}/eventsub`);
  console.log(`   Secret configured: ${webhookSecret ? 'Yes' : 'No'}`);

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
  console.log(`📝 Creating EventSub subscriptions for ${channelIds.length} channels...`);

  for (const [index, channelId] of channelIds.entries()) {
    try {
      console.log(`   Subscribing to channel ID: ${channelId} (${channels[index]})`);
      await eventSub.onChannelRedemptionAdd(channelId, (event) => {
        console.log(`🎯 Redemption received: "${event.rewardTitle}" by ${event.userName} in ${channels[index]}`);
        if (event.rewardTitle === redemptionTitle) {
          const loadout = generateRandomLoadout();
          const loadoutString = formatForTwitch(loadout);
          const channelName = channels[index];
          chatClient.say(channelName, loadoutString);
          console.log(`✅ Sent loadout to ${channelName}`);
        }
      });
      console.log(`   ✅ Subscription created for ${channels[index]}`);
    } catch (error) {
      console.error(`   ❌ Failed to subscribe to ${channels[index]}:`, error.message);
    }
  }

  console.log(`✅ All EventSub subscriptions created!`);

  await chatClient.connect();

  console.log(`✅ Twitch bot connected as ${botUsername}`);
  console.log(`📺 Listening to channels: ${channels.join(", ")}`);
  console.log(`🎯 Redemption trigger: "${redemptionTitle}"`);
  console.log(`🔗 EventSub webhooks ready at /eventsub`);
}
