ALTER TABLE "quiz" ADD COLUMN "certificate_description" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "certificate_logo_key" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "certificate_signature_key" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "certificate_instructor_label" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "certificate_instructor_value" text;--> statement-breakpoint
ALTER TABLE "quiz" DROP COLUMN "certificate_signature_text";
