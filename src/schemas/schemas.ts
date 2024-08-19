import { serial, pgTable, text, timestamp, pgEnum, integer, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const contactMode = pgEnum('contact_mode', ['email', 'phone']);

export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  contactMode: contactMode('contact_mode').notNull(),
  created_at: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey().notNull(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  otp_code: varchar('otp_code', { length: 10 }).notNull().unique(),
  expire_at: timestamp('expire_at').notNull(),
  created_at: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updated_at: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
