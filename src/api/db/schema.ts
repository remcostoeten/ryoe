import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    snippetsPath: text('snippets_path').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const snippets = sqliteTable('snippets', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    filePath: text('file_path').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})
