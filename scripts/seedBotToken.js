import "dotenv/config";
import { saveToken } from "../src/db/queries.js";

const BOT_USER_ID  = process.env.BOT_USER_ID;
const BOT_USERNAME = process.env.BOT_USERNAME;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
if (!BOT_USER_ID || !BOT_USERNAME || !ACCESS_TOKEN || !REFRESH_TOKEN) {
  console.error("Missing required env vars: BOT_USER_ID, BOT_USERNAME, ACCESS_TOKEN, REFRESH_TOKEN");
  process.exit(1);
}
await saveToken(BOT_USER_ID, BOT_USERNAME, {
  accessToken: ACCESS_TOKEN,
  refreshToken: REFRESH_TOKEN,
  scope: ["chat:read", "chat:edit"],
  expiresIn: 14400,
  obtainmentTimestamp: Date.now(),
}, true); 

console.log("✅ Bot token seeded");
process.exit(0);
