-- Seed plan data (safe to re-run)
INSERT INTO "plan" (id, name, price, currency, interval, paymongo_plan_id, features, is_active)
VALUES
  (
    'free',
    'Free',
    0,
    'PHP',
    'month',
    NULL,
    '{"maxQuizzesCreated":5,"maxQuestionsPerQuiz":999999,"maxAttemptsPerQuiz":999999,"maxImageQuestionsPerQuiz":999999}'::jsonb,
    true
  ),
  (
    'pro',
    'Pro',
    18900,
    'PHP',
    'month',
    NULL,
    '{"maxQuizzesCreated":999999,"maxQuestionsPerQuiz":999999,"maxAttemptsPerQuiz":999999,"maxImageQuestionsPerQuiz":999999}'::jsonb,
    true
  ),
  (
    'pro_plus',
    'Pro Plus',
    44900,
    'PHP',
    '3_months',
    NULL,
    '{"maxQuizzesCreated":999999,"maxQuestionsPerQuiz":999999,"maxAttemptsPerQuiz":999999,"maxImageQuestionsPerQuiz":999999}'::jsonb,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  interval = EXCLUDED.interval,
  paymongo_plan_id = EXCLUDED.paymongo_plan_id,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;
