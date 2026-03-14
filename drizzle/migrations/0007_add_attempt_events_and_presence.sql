ALTER TABLE "attempt" ADD COLUMN "last_seen_at" timestamp;
ALTER TABLE "attempt" ADD COLUMN "last_activity_at" timestamp;

CREATE TABLE "attempt_event" (
  "id" text PRIMARY KEY NOT NULL,
  "attempt_id" text NOT NULL,
  "type" text NOT NULL,
  "payload" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "attempt_event_attempt_id_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "attempt" ("id") ON DELETE cascade
);

CREATE INDEX "attempt_event_attempt_idx" ON "attempt_event" ("attempt_id");
CREATE INDEX "attempt_event_created_idx" ON "attempt_event" ("created_at");
