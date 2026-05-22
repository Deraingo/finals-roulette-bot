import { getPool } from "./index.js";

export async function saveToken(userId, username, tokenData, isBot = false) {
  const sql = `
    INSERT INTO twitch_tokens
      (user_id, username, access_token, refresh_token, scope, expires_in, obtainment_timestamp, is_bot, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      username             = EXCLUDED.username,
      access_token         = EXCLUDED.access_token,
      refresh_token        = EXCLUDED.refresh_token,
      scope                = EXCLUDED.scope,
      expires_in           = EXCLUDED.expires_in,
      obtainment_timestamp = EXCLUDED.obtainment_timestamp,
      updated_at           = NOW();
  `;
  await getPool().query(sql, [
    userId,
    username,
    tokenData.accessToken,
    tokenData.refreshToken,
    JSON.stringify(tokenData.scope ?? []),
    tokenData.expiresIn,
    tokenData.obtainmentTimestamp,
    isBot,
  ]);
}

export async function getAllTokens() {
  const { rows } = await getPool().query("SELECT * FROM twitch_tokens");
  return rows;
}

export async function deleteToken(userId) {
  await getPool().query("DELETE FROM twitch_tokens WHERE user_id = $1", [userId]);
}

export async function getStreamerChannels(){
    const {rows: channels} = await getPool().query("SELECT username, user_id from twitch_tokens WHERE is_bot = FALSE")
    return channels
}