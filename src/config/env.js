import dotenv from "dotenv";
dotenv.config();

const branch = process.env.RENDER_GIT_BRANCH;
const forceProd = process.env.FORCE_PROD === "true";
function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required in env`);
  return v;
}

export const IS_PROD = forceProd || branch === "main";

export const PORT = Number(process.env.PORT) || 3000;

const renderHost = process.env.RENDER_EXTERNAL_HOSTNAME;

export const PUBLIC_HOST = IS_PROD && renderHost
  ? `https://${renderHost}`
  : `http://localhost:${PORT}`;

export const TWITCH_REDIRECT_URI = `${PUBLIC_HOST}/auth/twitch/callback`;
export const ENABLE_EVENTSUB_WEBHOOKS = IS_PROD;
export const TWITCH_CLIENT_ID = required("TWITCH_CLIENT_ID");
export const TWITCH_CLIENT_SECRET = required("TWITCH_CLIENT_SECRET");
export const TWITCH_WEBHOOK_SECRET = required("TWITCH_WEBHOOK_SECRET");
export const TWITCH_REDEMPTION_TITLE = required("TWITCH_REDEMPTION_TITLE");
export const DATABASE_URL = required("DATABASE_URL");
export const DISCORD_TOKEN = required("DISCORD_TOKEN");
export const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required. See Track 0.2 to generate one.");
}

console.log(`🌎 env: IS_PROD=${IS_PROD}, host=${PUBLIC_HOST}`);