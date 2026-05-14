import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contactFormSubmissions = sqliteTable("contact_form_submissions", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  budget: text("budget").notNull(),
  message: text("message"),
  ip: text("ip"),
  submittedAt: text("submitted_at").notNull(),
});
