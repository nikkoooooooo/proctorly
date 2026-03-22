CREATE TABLE "attempt_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"option_id" text,
	"text_answer" text,
	"is_correct" boolean,
	"answered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attempt_event" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_question_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"remaining_time" integer NOT NULL,
	"order_index" integer,
	"is_answered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"student_id" text NOT NULL,
	"quiz_id" text NOT NULL,
	"template_id" text,
	"serial_number" text NOT NULL,
	"s3_key" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificate_template" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"bg_key" text NOT NULL,
	"size" text DEFAULT 'A4_LANDSCAPE',
	"fields" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text NOT NULL,
	"interval" text NOT NULL,
	"paymongo_plan_id" text,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"source" text NOT NULL,
	"paymongo_link_id" text,
	"paymongo_link_reference" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"paymongo_customer_id" text,
	"paymongo_subscription_id" text,
	"paymongo_link_id" text,
	"paymongo_link_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"quizzes_created" integer DEFAULT 0 NOT NULL,
	"questions_created" integer DEFAULT 0 NOT NULL,
	"images_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempt" DROP CONSTRAINT "attempt_quiz_id_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "option" ALTER COLUMN "is_correct" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "tab_switch_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "last_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "attempt" ADD COLUMN "last_activity_at" timestamp;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "position" integer;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "time_limit" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "points" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "blur_question" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "is_paid_quiz" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "paid_quiz_fee" integer;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "passing_score" integer;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "certificate_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "student_no_encrypted" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "section" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "plan_id" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_status" text;--> statement-breakpoint
ALTER TABLE "attempt_answer" ADD CONSTRAINT "attempt_answer_attempt_id_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answer" ADD CONSTRAINT "attempt_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answer" ADD CONSTRAINT "attempt_answer_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_event" ADD CONSTRAINT "attempt_event_attempt_id_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_question_progress" ADD CONSTRAINT "attempt_question_progress_attempt_id_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_question_progress" ADD CONSTRAINT "attempt_question_progress_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_attempt_id_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_template_id_certificate_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."certificate_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate_template" ADD CONSTRAINT "certificate_template_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_payment" ADD CONSTRAINT "quiz_payment_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_payment" ADD CONSTRAINT "quiz_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_plan_id_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_answer_unique_idx" ON "attempt_answer" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "attempt_event_attempt_idx" ON "attempt_event" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "attempt_event_created_idx" ON "attempt_event" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_question_unique_idx" ON "attempt_question_progress" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "attempt_question_attempt_idx" ON "attempt_question_progress" USING btree ("attempt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_user_period_idx" ON "usage" USING btree ("user_id","period_start","period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_event_unique_idx" ON "webhook_event" USING btree ("provider","event_id");--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_enrollment_unique_idx" ON "quiz_enrollment" USING btree ("user_id","quiz_id");