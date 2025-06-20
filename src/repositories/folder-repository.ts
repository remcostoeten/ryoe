/**
 * Folder repository - pure functions for folder data access
 */

import { findById, findMany, create, update, deleteById } from './base-repository'
import type {
	TFolder,
	TCreateFolderData,
	TUpdateFolderData,
	TRepositoryResult,
	TRepositoryListResult,
	TPaginationOptions,
	TSortOptions,
	TFilterOptions,
} from '.'

const TABLE_NAME = 'folders'

function mapRowToFolder(row: any): TFolder {
	return {
		id: Number(row.id),
		name: String(row.name),
		parentId: row.parent_id ? Number(row.parent_id) : undefined,
		position: Number(row.position || 0),
		isFavorite: Boolean(row.is_favorite || false),
		createdAt: Number(row.created_at),
		updatedAt: Number(row.updated_at),
	}
}

function mapFolderDataToRow(data: TCreateFolderData | TUpdateFolderData): Record<string, any> {
	const row: Record<string, any> = {}

	if ('name' in data && data.name !== undefined) {
		row.name = data.name
	}
	if ('parentId' in data) {
		row.parent_id = data.parentId || null
	}
	if ('position' in data && data.position !== undefined) {
		row.position = data.position
	}
	if ('isFavorite' in data && data.isFavorite !== undefined) {
		row.is_favorite = data.isFavorite
	}

	return row
}

export async function findFolderById(id: number): Promise<TRepositoryResult<TFolder>> {
	return findById(TABLE_NAME, id, mapRowToFolder)
}

export async function findFolders(options?: {
	filters?: TFilterOptions
	sort?: TSortOptions
	pagination?: TPaginationOptions
}): Promise<TRepositoryListResult<TFolder>> {
	return findMany(TABLE_NAME, mapRowToFolder, options)
}

export async function findRootFolders(): Promise<TRepositoryListResult<TFolder>> {
	return findFolders({
		filters: { parent_id: null },
		sort: { field: 'position', direction: 'asc' },
	})
}

export async function findChildFolders(parentId: number): Promise<TRepositoryListResult<TFolder>> {
	return findFolders({
		filters: { parent_id: parentId },
		sort: { field: 'position', direction: 'asc' },
	})
}

export async function findFoldersByName(name: string): Promise<TRepositoryListResult<TFolder>> {
	return findFolders({
		filters: { name },
		sort: { field: 'created_at', direction: 'desc' },
	})
}

export async function createFolder(data: TCreateFolderData): Promise<TRepositoryResult<TFolder>> {
	// If no position specified, get the next position in the parent folder
	let position = data.position
	if (position === undefined) {
		const existingFolders = data.parentId
			? await findChildFolders(data.parentId)
			: await findRootFolders()

		if (existingFolders.success && existingFolders.data) {
			position = existingFolders.data.length
		} else {
			position = 0
		}
	}

	const rowData = {
		...mapFolderDataToRow({ ...data, position }),
	}

	return create(TABLE_NAME, rowData, mapRowToFolder)
}

export async function updateFolder(
	id: number,
	data: TUpdateFolderData
): Promise<TRepositoryResult<TFolder>> {
	const rowData = mapFolderDataToRow(data)
	return update(TABLE_NAME, id, rowData, mapRowToFolder)
}

export async function deleteFolder(id: number): Promise<TRepositoryResult<boolean>> {
	return deleteById(TABLE_NAME, id)
}

export async function moveFolder(
	id: number,
	newParentId: number | null,
	newPosition?: number
): Promise<TRepositoryResult<TFolder>> {
	// If no position specified, move to end of target parent
	let position = newPosition
	if (position === undefined) {
		const existingFolders = newParentId
			? await findChildFolders(newParentId)
			: await findRootFolders()

		if (existingFolders.success && existingFolders.data) {
			position = existingFolders.data.length
		} else {
			position = 0
		}
	}

	return updateFolder(id, { parentId: newParentId || undefined, position })
}

export async function reorderFolders(
	_parentId: number | null,
	folderIds: number[]
): Promise<TRepositoryResult<boolean>> {
	try {
		// Update position for each folder
		const updatePromises = folderIds.map((folderId, index) =>
			updateFolder(folderId, { position: index })
		)

		const results = await Promise.all(updatePromises)
		const hasErrors = results.some(result => !result.success)

		if (hasErrors) {
			return { success: false, error: 'Failed to reorder some folders' }
		}

		return { success: true, data: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function getFolderHierarchy(): Promise<TRepositoryResult<TFolder[]>> {
	try {
		const allFolders = await findFolders({
			sort: { field: 'position', direction: 'asc' },
		})

		if (!allFolders.success || !allFolders.data) {
			return allFolders
		}

		// Build hierarchy (this is a simplified version)
		// In a real app, you might want to build a tree structure
		return { success: true, data: allFolders.data }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function getFolderPath(id: number): Promise<TRepositoryResult<TFolder[]>> {
	try {
		const path: TFolder[] = []
		let currentId: number | undefined = id

		while (currentId) {
			const folder = await findFolderById(currentId)
			if (!folder.success || !folder.data) {
				break
			}

			path.unshift(folder.data)
			currentId = folder.data.parentId
		}

		return { success: true, data: path }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function toggleFolderFavorite(id: number): Promise<TRepositoryResult<TFolder>> {
	try {
		const folder = await findFolderById(id)
		if (!folder.success || !folder.data) {
			return { success: false, error: 'Folder not found' }
		}

		return updateFolder(id, { isFavorite: !folder.data.isFavorite })
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function findFavoriteFolders(): Promise<TRepositoryListResult<TFolder>> {
	return findFolders({
		filters: { is_favorite: true },
		sort: { field: 'name', direction: 'asc' },
	})
}
