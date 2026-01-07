CREATE TABLE "quiz_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "option" DROP CONSTRAINT "option_question_id_question_id_fk";
--> statement-breakpoint
ALTER TABLE "question" DROP CONSTRAINT "question_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "join_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_enrollment" ADD CONSTRAINT "quiz_enrollment_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_enrollment" ADD CONSTRAINT "quiz_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enrollment_user_quiz_idx" ON "quiz_enrollment" USING btree ("user_id","quiz_id");--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_join_code_unique" UNIQUE("join_code");