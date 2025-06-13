// File: api/src/db/schema.ts

import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ตาราง users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ตาราง posts
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // <-- [แก้ไข] เพิ่ม onDelete: 'cascade'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ตาราง comments
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }), // <-- [แก้ไข] เพิ่ม onDelete: 'cascade'
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // <-- [แก้ไข] เพิ่ม onDelete: 'cascade'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations (ความสัมพันธ์)
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));