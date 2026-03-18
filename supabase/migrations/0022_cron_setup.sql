-- Enable pg_net extension for HTTP calls from pg_cron
-- Note: pg_net is required to invoke Edge Functions from pg_cron
-- Enable these extensions in Supabase Dashboard → Database → Extensions

-- Cron job: run daily automations at 10:00 AM Mexico City time (UTC-6 = 16:00 UTC)
-- This requires pg_cron to be enabled in Supabase Dashboard

-- Example setup (run manually after enabling pg_cron + pg_net extensions):
--
-- SELECT cron.schedule(
--   'menuos-daily-automations',
--   '0 16 * * *',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.supabase_url') || '/functions/v1/cron-automations',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.cron_secret')
--     ),
--     body := '{}'::jsonb
--   )
--   $$
-- );

-- Store the Supabase URL and cron secret as DB settings (set via psql or Supabase SQL editor)
-- ALTER DATABASE postgres SET "app.cron_secret" = 'your-secret-here';
-- ALTER DATABASE postgres SET "app.supabase_url" = 'https://your-project.supabase.co';

-- Add cron_secret to functions .env.example (already documented)
-- supabase secrets set CRON_SECRET=your-secret-here
