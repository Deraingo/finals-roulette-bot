import { AppTokenAuthProvider, StaticAuthProvider} from "@twurple/auth";
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

  const token = oauthToken.replace("oauth:", "");
  const chatAuthProvider = new StaticAuthProvider(clientId, token, [
    "chat:read",
    "chat:edit",
  ]);
  const appAuthProvider = new AppTokenAuthProvider(clientId, clientSecret);
  const apiClient = new ApiClient({ authProvider: appAuthProvider });
  const chatClient = new ChatClient({
    authProvider: chatAuthProvider,
    channels,
  });

  const hostName = process.env.RENDER_EXTERNAL_HOSTNAME ||
                   process.env.RENDER_EXTERNAL_URL?.replace(/^https?:\/\//, '') ||
                   'localhost:3000';

  console.log(`🔍 EventSub Config:`);
  console.log(`   Hostname: ${hostName}`);
  console.log(`   Webhook URL: https://${hostName}/eventsub`);
  console.log(`   Secret configured: ${webhookSecret ? 'Yes' : 'No'}`);

  const eventSub = new EventSubMiddleware({
    apiClient,
    hostName,
    pathPrefix: "/eventsub",
    secret: webhookSecret,
  });

  await eventSub.apply(expressApp);
  await chatClient.connect();

  console.log(`✅ Twitch bot connected as ${botUsername}`);
  console.log(`📺 Listening to channels: ${channels.join(", ")}`);
  console.log(`🎯 Redemption trigger: "${redemptionTitle}"`);

  // Return object with eventSub AND subscribe function
  return {
    eventSub,
    subscribe: async () => {
      // This code only runs when you call twitchBot.subscribe()
      console.log(`📝 Creating EventSub subscriptions for ${channelIds.length} channels...`);

      for (const [index, channelId] of channelIds.entries()) {
        try {
          console.log(`   Subscribing to channel ID: ${channelId} (${channels[index]})`);
          const subscription = await eventSub.onChannelRedemptionAdd(channelId, (event) => {
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
          console.error(`   ❌ Failed to subscribe to ${channels[index]}:`, error);
        }
      }
      console.log(`✅ All EventSub subscriptions created!`);
      console.log(`🔗 EventSub webhooks ready at /eventsub`);
    }
  };
}
