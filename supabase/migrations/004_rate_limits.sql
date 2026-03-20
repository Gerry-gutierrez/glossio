-- Rate limits table for persistent rate limiting across serverless cold starts
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,           -- e.g. "otp:+15551234567" or "booking:192.168.1.1"
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  window_seconds integer NOT NULL DEFAULT 600,  -- 10 min default
  CONSTRAINT rate_limits_key_unique UNIQUE (key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits (key);

-- Auto-cleanup: delete expired windows older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start + (window_seconds || ' seconds')::interval < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: only service_role can access (called from serverless functions)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access — only service_role key bypasses RLS
