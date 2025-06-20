import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	snippetsPath: text('snippets_path').notNull(),
	isSetupComplete: integer('is_setup_complete', { mode: 'boolean' }).notNull().default(false),
	storageType: text('storage_type').notNull().default('turso'), // 'local' or 'turso'
	preferences: text('preferences'), // JSON string for user preferences
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
})

export const snippets = sqliteTable('snippets', {
	id: integer('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(),
	filePath: text('file_path').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Folders table with hierarchical structure
export const folders = sqliteTable('folders', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	parentId: integer('parent_id').references(() => folders.id), // Self-referencing for hierarchy
	position: integer('position').notNull().default(0), // For ordering within same parent
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false), // Privacy setting
	isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false), // Favorite status
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Notes table with MDX support
export const notes = sqliteTable('notes', {
	id: integer('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(), // MDX content
	folderId: integer('folder_id').references(() => folders.id), // Can be null for root notes
	position: integer('position').notNull().default(0), // For ordering within folder
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false), // Privacy setting
	isFavorite: integer('is_favorite', { mode: 'boolean' }).notNull().default(false), // Favorite status
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Tags table for organizing notes
export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey(),
	name: text('name').notNull().unique(),
	color: text('color').notNull().default('#6b7280'),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Note-Tag junction table for many-to-many relationship
export const noteTags = sqliteTable(
	'note_tags',
	{
		id: integer('id').primaryKey(),
		noteId: integer('note_id')
			.notNull()
			.references(() => notes.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	},
	table => ({
		// Ensure a note can't have the same tag twice
		uniqueNoteTag: unique().on(table.noteId, table.tagId),
	})
)
