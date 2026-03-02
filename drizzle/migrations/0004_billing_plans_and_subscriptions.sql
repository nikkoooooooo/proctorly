ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plan_id" text DEFAULT 'free';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_status" text;

CREATE TABLE IF NOT EXISTS "plan" (
  id text PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL,
  currency text NOT NULL,
  interval text NOT NULL,
  features jsonb NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscription" (
  id text PRIMARY KEY,
  user_id text NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES "plan"(id),
  status text NOT NULL,
  current_period_start timestamp,
  current_period_end timestamp,
  paymongo_customer_id text,
  paymongo_subscription_id text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "usage" (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  period_start timestamp NOT NULL,
  period_end timestamp NOT NULL,
  quizzes_created integer DEFAULT 0 NOT NULL,
  questions_created integer DEFAULT 0 NOT NULL,
  images_used integer DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "usage_user_period_idx" ON "usage" ("user_id", "period_start", "period_end");

CREATE TABLE IF NOT EXISTS "webhook_event" (
  id text PRIMARY KEY,
  provider text NOT NULL,
  event_id text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "webhook_event_unique_idx" ON "webhook_event" ("provider", "event_id");
