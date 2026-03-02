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
    '{"maxQuizzesCreated":3,"maxQuestionsPerQuiz":30,"maxAttemptsPerQuiz":100,"maxImageQuestionsPerQuiz":5}'::jsonb,
    true
  ),
  (
    'early_access',
    'Early Access',
    24900,
    'PHP',
    'month',
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
