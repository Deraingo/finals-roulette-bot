import { StaticAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { EventSubMiddleware } from "@twurple/eventsub-http";
import { ChatClient } from "@twurple/chat";
import { generateRandomLoadout } from "./src/data/loadoutGenerator.js";
import { formatForTwitch } from "./src/utils/formatters.js";

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

  // Get the hostname for EventSub webhooks
  // Render automatically provides RENDER_EXTERNAL_HOSTNAME
  const hostName = process.env.RENDER_EXTERNAL_HOSTNAME || 
                   process.env.RENDER_EXTERNAL_URL?.replace(/^https?:\/\//, '') || 
                   'localhost';

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
    strictHostCheck: false, // Important for Render's reverse proxy
  });

  // Apply EventSub middleware to Express app
  console.log(`🔗 Applying EventSub middleware...`);
  await eventSub.apply(expressApp);
  console.log(`✅ EventSub middleware applied`);

  // Subscribe to channel point redemptions for each channel
  console.log(`📝 Creating EventSub subscriptions for ${channelIds.length} channels...`);

  for (const [index, channelId] of channelIds.entries()) {
    try {
      console.log(`   Subscribing to channel ID: ${channelId} (${channels[index]})`);
      
      const listener = await eventSub.onChannelRedemptionAdd(channelId, (event) => {
        console.log(`🎯 Redemption received: "${event.rewardTitle}" by ${event.userName} in ${channels[index]}`);
        
        if (event.rewardTitle === redemptionTitle) {
          try {
            const loadout = generateRandomLoadout();
            const loadoutString = formatForTwitch(loadout);
            const channelName = channels[index];
            chatClient.say(channelName, loadoutString);
            console.log(`✅ Sent loadout to ${channelName}`);
          } catch (error) {
            console.error(`❌ Error generating/sending loadout:`, error);
          }
        }
      });
      
      console.log(`   ✅ Subscription created for ${channels[index]}`);
    } catch (error) {
      console.error(`   ❌ Failed to subscribe to ${channels[index]}:`, error.message);
      // Continue with other channels even if one fails
    }
  }

  console.log(`✅ All EventSub subscriptions created!`);

  // Connect chat client
  console.log(`💬 Connecting to Twitch chat...`);
  await chatClient.connect();
  console.log(`✅ Twitch bot connected as ${botUsername}`);
  console.log(`📺 Listening to channels: ${channels.join(", ")}`);
  console.log(`🎯 Redemption trigger: "${redemptionTitle}"`);
  console.log(`🔗 EventSub webhooks ready at /eventsub`);

  return { chatClient, eventSub, apiClient };
}