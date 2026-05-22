import { ApiClient } from "@twurple/api";
import { EventSubMiddleware } from "@twurple/eventsub-http";
import { ChatClient } from "@twurple/chat";
import { generateRandomLoadout } from "../data/loadoutGenerator.js";
import { formatForTwitch } from "../utils/formatters.js";
import { buildAuthProvider } from "../auth/twitchAuth.js";
import { PUBLIC_HOST } from "../config/env.js";

export async function initTwitchBot(config) {
  const {
    clientId,
    clientSecret,
    channels,
    channelIds,
    redemptionTitle,
    expressApp,
    webhookSecret,
  } = config;

  const authProvider = await buildAuthProvider({ clientId, clientSecret });
  const apiClient = new ApiClient({ authProvider });
  const chatClient = new ChatClient({ authProvider, channels });

  const hostName = PUBLIC_HOST.replace(/^https?:\/\//, "");

  console.log(`🔍 EventSub Config:`);
  console.log(`   Hostname: ${hostName}`);
  console.log(`   Webhook URL: https://${hostName}/eventsub`);
  console.log(`   Secret configured: ${webhookSecret ? "Yes" : "No"}`);

  const eventSub = new EventSubMiddleware({
    apiClient,
    hostName,
    pathPrefix: "/eventsub",
    secret: webhookSecret,
  });

  await eventSub.apply(expressApp);
  await chatClient.connect();

  console.log(`✅ Twitch bot connected`);
  console.log(`📺 Listening to channels: ${channels.join(", ")}`);
  console.log(`🎯 Redemption trigger: "${redemptionTitle}"`);

  return {
    eventSub,
    authProvider,
    apiClient,
    chatClient,
    subscribe: async () => {
      console.log(`📝 Creating EventSub subscriptions for ${channelIds.length} channels...`);

      for (const [index, channelId] of channelIds.entries()) {
        try {
          console.log(`   Subscribing to channel ID: ${channelId} (${channels[index]})`);
          await eventSub.onChannelRedemptionAdd(channelId, (event) => {
            console.log(`🎯 Redemption received: "${event.rewardTitle}" by ${event.userName} in ${channels[index]}`);
            if (event.rewardTitle === redemptionTitle) {
              const loadout = generateRandomLoadout();
              const loadoutString = formatForTwitch(loadout);
              chatClient.say(channels[index], loadoutString);
              console.log(`✅ Sent loadout to ${channels[index]}`);
            }
          });
          console.log(`   ✅ Subscription created for ${channels[index]}`);
        } catch (error) {
          console.error(`   ❌ Failed to subscribe to ${channels[index]}:`, error);
        }
      }

      console.log(`✅ All EventSub subscriptions created!`);
      console.log(`🔗 EventSub webhooks ready at /eventsub`);
    },
  };
}
