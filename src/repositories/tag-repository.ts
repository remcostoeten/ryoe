import { getTursoClient } from '@/api/db/clients/turso-client'
export type TTagRepository = {
	id: number
	name: string
	color: string
	description: string | null
	created_at: number
	updated_at: number
}

export type TNoteTagRepository = {
	id: number
	note_id: number
	tag_id: number
	created_at: number
}

// Covert repository tag to domain tag
function mapRepositoryTagToDomain(repoTag: TTagRepository): TTag {
	return {
		id: repoTag.id,
		name: repoTag.name,
		color: repoTag.color,
		description: repoTag.description || undefined,
		createdAt: new Date(repoTag.created_at * 1000),
		updatedAt: new Date(repoTag.updated_at * 1000),
	}
}

// Convert repository note-tag to domain note-tag
function mapRepositoryNoteTagToDomain(repoNoteTag: TNoteTagRepository): TNoteTag {
	return {
		id: repoNoteTag.id,
		noteId: repoNoteTag.note_id,
		tagId: repoNoteTag.tag_id,
		createdAt: new Date(repoNoteTag.created_at * 1000),
	}
}

// Tag repository implementation
export class TagRepository {
	private getDatabase() {
		return getTursoClient()
	}

	async createTag(data: TCreateTagData): Promise<TTag> {
		const db = this.getDatabase()
		const now = Math.floor(Date.now() / 1000)

		const result = await db.execute({
			sql: `INSERT INTO tags (name, color, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)`,
			args: [data.name, data.color || '#6b7280', data.description || null, now, now],
		})

		const tagResult = await db.execute({
			sql: 'SELECT * FROM tags WHERE id = ?',
			args: [Number(result.lastInsertRowid)],
		})

		const tag = tagResult.rows as unknown as TTagRepository[]

		if (!tag[0]) {
			throw new Error('Failed to create tag')
		}

		return mapRepositoryTagToDomain(tag[0])
	}

	async updateTag(id: number, data: TUpdateTagData): Promise<TTag> {
		const db = this.getDatabase()
		const now = Math.floor(Date.now() / 1000)

		const updates: string[] = []
		const values: any[] = []

		if (data.name !== undefined) {
			updates.push('name = ?')
			values.push(data.name)
		}

		if (data.color !== undefined) {
			updates.push('color = ?')
			values.push(data.color)
		}

		if (data.description !== undefined) {
			updates.push('description = ?')
			values.push(data.description)
		}

		updates.push('updated_at = ?')
		values.push(now)
		values.push(id)

		await db.execute({
			sql: `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`,
			args: values,
		})

		const tagResult = await db.execute({
			sql: 'SELECT * FROM tags WHERE id = ?',
			args: [id],
		})

		const tag = tagResult.rows as unknown as TTagRepository[]

		if (!tag[0]) {
			throw new Error('Tag not found')
		}

		return mapRepositoryTagToDomain(tag[0])
	}

	async deleteTag(id: number): Promise<void> {
		const db = this.getDatabase()

		// First delete all note-tag associations
		await db.execute({
			sql: 'DELETE FROM note_tags WHERE tag_id = ?',
			args: [id],
		})

		// Then delete the tag
		await db.execute({
			sql: 'DELETE FROM tags WHERE id = ?',
			args: [id],
		})
	}

	async getTagById(id: number): Promise<TTag | null> {
		const db = this.getDatabase()

		const result = await db.execute({
			sql: 'SELECT * FROM tags WHERE id = ?',
			args: [id],
		})

		const tags = result.rows as unknown as TTagRepository[]
		return tags[0] ? mapRepositoryTagToDomain(tags[0]) : null
	}

	async getAllTags(): Promise<TTag[]> {
		const db = this.getDatabase()

		const result = await db.execute({
			sql: 'SELECT * FROM tags ORDER BY name ASC',
			args: [],
		})

		const tags = result.rows as unknown as TTagRepository[]
		return tags.map(mapRepositoryTagToDomain)
	}

	async getTagsByNoteId(noteId: number): Promise<TTag[]> {
		const db = this.getDatabase()

		const result = await db.execute({
			sql: `SELECT t.* FROM tags t
            INNER JOIN note_tags nt ON t.id = nt.tag_id
            WHERE nt.note_id = ?
            ORDER BY t.name ASC`,
			args: [noteId],
		})

		const tags = result.rows as unknown as TTagRepository[]
		return tags.map(mapRepositoryTagToDomain)
	}

	async addTagToNote(noteId: number, tagId: number): Promise<TNoteTag> {
		const db = this.getDatabase()
		const now = Math.floor(Date.now() / 1000)

		// Check if association already exists
		const existingResult = await db.execute({
			sql: 'SELECT * FROM note_tags WHERE note_id = ? AND tag_id = ?',
			args: [noteId, tagId],
		})

		const existing = existingResult.rows as unknown as TNoteTagRepository[]
		if (existing.length > 0) {
			return mapRepositoryNoteTagToDomain(existing[0])
		}

		const result = await db.execute({
			sql: 'INSERT INTO note_tags (note_id, tag_id, created_at) VALUES (?, ?, ?)',
			args: [noteId, tagId, now],
		})

		const noteTagResult = await db.execute({
			sql: 'SELECT * FROM note_tags WHERE id = ?',
			args: [Number(result.lastInsertRowid)],
		})

		const noteTag = noteTagResult.rows as unknown as TNoteTagRepository[]
		if (!noteTag[0]) {
			throw new Error('Failed to add tag to note')
		}

		return mapRepositoryNoteTagToDomain(noteTag[0])
	}

	async removeTagFromNote(noteId: number, tagId: number): Promise<void> {
		const db = this.getDatabase()

		await db.execute({
			sql: 'DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?',
			args: [noteId, tagId],
		})
	}

	async getNoteIdsByTagId(tagId: number): Promise<number[]> {
		const db = this.getDatabase()

		const result = await db.execute({
			sql: 'SELECT note_id FROM note_tags WHERE tag_id = ?',
			args: [tagId],
		})

		const results = result.rows as unknown as { note_id: number }[]
		return results.map(r => r.note_id)
	}

	async searchTags(query: string): Promise<TTag[]> {
		const db = this.getDatabase()

		const result = await db.execute({
			sql: 'SELECT * FROM tags WHERE name LIKE ? ORDER BY name ASC',
			args: [`%${query}%`],
		})

		const tags = result.rows as unknown as TTagRepository[]
		return tags.map(mapRepositoryTagToDomain)
	}
}

// Export singleton instance
export const tagRepository = new TagRepository()
