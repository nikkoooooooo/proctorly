-- Step 7: Backfill existing users to free plan
UPDATE "user"
SET plan_id = 'free',
    subscription_status = 'inactive'
WHERE plan_id IS NULL;

-- Optional: manually upgrade a user to Early Access
-- Replace USER_ID with the real user id
--
-- INSERT INTO subscription (
--   id, user_id, plan_id, status, current_period_start, current_period_end
-- ) VALUES (
--   gen_random_uuid(), 'USER_ID', 'early_access', 'active', now(), now() + interval '1 month'
-- );
--
-- UPDATE "user"
-- SET plan_id = 'early_access',
--     subscription_status = 'active'
-- WHERE id = 'USER_ID';
