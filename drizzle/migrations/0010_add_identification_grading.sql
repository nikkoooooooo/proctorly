ALTER TABLE "question"
  ADD COLUMN "correct_answers" jsonb,
  ADD COLUMN "match_strategy" text DEFAULT 'exact',
  ADD COLUMN "case_sensitive" boolean DEFAULT false NOT NULL,
  ADD COLUMN "trim_whitespace" boolean DEFAULT true NOT NULL,
  ADD COLUMN "normalize" boolean DEFAULT false NOT NULL;
