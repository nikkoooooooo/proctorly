-- Add description column to quiz
ALTER TABLE "quiz"
ADD COLUMN IF NOT EXISTS "description" text;

-- Create quiz_enrollment table if it doesn't exist
CREATE TABLE IF NOT EXISTS "quiz_enrollment" (
    id text PRIMARY KEY,
    quiz_id text NOT NULL REFERENCES "quiz"(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    joined_at timestamp DEFAULT now()
);

-- Add index
CREATE INDEX IF NOT EXISTS "enrollment_user_quiz_idx" ON "quiz_enrollment" ("user_id", "quiz_id");
