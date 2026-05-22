INSERT INTO twitch_tokens
  (user_id, username, access_token, refresh_token, scope, obtainment_timestamp, is_bot)
VALUES
  ('751991397', 'deraingo_', 'placeholder', 'placeholder', '["chat:read"]'::jsonb, 0, FALSE),
  ('478296725', 'lostboykaleido', 'placeholder', 'placeholder', '["chat:read"]'::jsonb, 0, FALSE)
ON CONFLICT (user_id) DO NOTHING;