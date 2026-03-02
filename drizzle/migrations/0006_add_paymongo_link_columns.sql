ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "paymongo_link_id" text;
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "paymongo_link_reference" text;
