ALTER TABLE "certificate_template" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "certificate_template" CASCADE;--> statement-breakpoint
ALTER TABLE "certificate" DROP CONSTRAINT IF EXISTS "certificate_template_id_certificate_template_id_fk";
--> statement-breakpoint
ALTER TABLE "certificate" DROP COLUMN "template_id";
--> statement-breakpoint
ALTER TABLE "quiz" DROP COLUMN IF EXISTS "certificate_template_source";
