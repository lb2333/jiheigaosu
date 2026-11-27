import {
  pgTable,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const aiThreads = pgTable(
  'ai_threads',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    scenario: text('scenario').notNull().default('analysis'), // exhibition | analysis | field | drawer
    title: text('title').notNull(),
    pinned: boolean('pinned').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('ai_threads_user_scenario_idx').on(t.userId, t.scenario, t.updatedAt)]
);

export const aiMessages = pgTable(
  'ai_messages',
  {
    id: text('id').primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => aiThreads.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // user | assistant | system
    parts: jsonb('parts').$type<Array<Record<string, unknown>>>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('ai_messages_thread_created_idx').on(t.threadId, t.createdAt)]
);
