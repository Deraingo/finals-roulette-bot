CREATE TABLE IF NOT EXISTS twitch_tokens (
  user_id              TEXT PRIMARY KEY,
  username             TEXT NOT NULL,
  access_token         TEXT NOT NULL,
  refresh_token        TEXT NOT NULL,
  scope                JSONB NOT NULL,
  expires_in           INTEGER,
  obtainment_timestamp BIGINT NOT NULL,
  is_bot               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS twitch_tokens_username_idx ON twitch_tokens (username);