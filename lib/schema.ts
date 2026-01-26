import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index , integer} from "drizzle-orm/pg-core";


// export const user = pgTable("user", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   emailVerified: boolean("email_verified").default(false).notNull(),
//   image: text("image"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at")
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
// });

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  studentNo: text("student_no"),       // NEW: student number
  section: text("section"),            // NEW: section
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);


export const quiz = pgTable("quiz", { // TABLE QUIZ
  id: text("id").primaryKey(), // id for quiz for and this is the PK
  title: text("title").notNull(), // title for quiz should not be null
  description: text("description"), // description per quiz
  joinCode: text("join_code").notNull().unique(), // joinCode for every quizzes should be unique and not null also
  creatorId: text("creator_id") // creatorId field for the user who created the the quiz
    .notNull()                  // should not be null so we can know who created the quiz
    .references(() => user.id), // taking the user.id as a FK, so that we can know who specifically created the quiz


  // Proctoring columns
  blurQuestion: boolean("blur_question").default(false).notNull(),
  disableCopyPaste: boolean("disable_copy_paste").default(false).notNull(),
  tabMonitoring: boolean("tab_monitoring").default(false).notNull(),  

  createdAt: timestamp("created_at").defaultNow(),
});


export const question = pgTable("question", { // TABLE QUESTION
  id: text("id").primaryKey(), // id for question and this is the PK
  quizId: text("quiz_id") // connecting it to the QUIZ TABLE, so we could know where this question belongs to
    .notNull()  // is should not be null
    .references(() => quiz.id, { onDelete: "cascade" }), // refereing the QUIZ ID to connect it to this question / questions belongs to QUIZ

  text: text("text").notNull(), // text on question
  type: text("type").notNull(), // "mcq" | "true-false" | "identification"
  timerLimit: integer("time_limit").default(30).notNull() // timer per question
});


export const option = pgTable("option", {
  id: text("id").primaryKey(),  // id for option and its primary key also

  questionId: text("question_id") // connecting it to the question, since option belong to a question
    .notNull()  // it should not be null, so that we can know what question this option belongs to
    .references(() => question.id, { onDelete: "cascade" }), // taking the question ID for FK, so that we could connect this option in the question 

  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false),
});


export const attempt = pgTable("attempt", {
  id: text("id").primaryKey(), // per attempt to the quiz

  quizId: text("quiz_id") // taking the id of the quiz that user attempted to answer
    .notNull() // it should not be null, so that we could know what quiz did he answers
    .references(() => quiz.id, { onDelete: "cascade" }), // passing the id of the quiz the user take

  userId: text("user_id")// taking th id of the user who take the quiz 
    .notNull() // it should not be null, so that we could know who is the user take the quiz
    .references(() => user.id), // passing the id of the user, that attempted to asnwer

  score: integer("score"), // score of the user

  isCompleted: boolean("completed").default(false).notNull(),

  tabSwitchCount: integer("tab_switch_count").default(0).notNull(),

  startedAt: timestamp("started_at").defaultNow(), 
  updatedAt: timestamp("updated_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});


export const attemptAnswer = pgTable("attempt_answer", {
  id: text("id").primaryKey(),

  attemptId: text("attempt_id")
    .notNull()
    .references(() => attempt.id, { onDelete: "cascade" }),

  questionId: text("question_id")
    .notNull()
    
    .references(() => question.id, { onDelete: "cascade" }),

  optionId: text("option_id")  // nullable because identification questions don't use options
    .references(() => option.id),

  textAnswer: text("text_answer"), // for identification or open-ended answers

  isCorrect: boolean("is_correct"), // store computed correctness for faster grading

  answeredAt: timestamp("answered_at").defaultNow(),
});



export const quizEnrollment = pgTable( // table for tracking who joined in the quiz 
  "quiz_enrollment",
  {
    id: text("id").primaryKey(), // id per row

    quizId: text("quiz_id") // taking the quiz id to know what quiz did they joined/enroll
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),

    userId: text("user_id") // to know who is the user joined in a quiz
      .notNull() // should not be null/ so that we know who joined
      .references(() => user.id, { onDelete: "cascade" }),

    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => [
    index("enrollment_user_quiz_idx").on(table.userId, table.quizId), // this is for fast querying making the db already know who is our target
  ]
);








export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


