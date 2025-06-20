// Repository interfaces - Domain layer contracts
import type { TFolder, TNote, TWorkspaceItem, TWorkspaceStats } from '../entities/workspace'

// Base repository interface
export interface IBaseRepository<T> {
	findById(id: number): Promise<T | null>
	findAll(): Promise<T[]>
	create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
	update(id: number, updates: Partial<T>): Promise<T>
	delete(id: number): Promise<void>
}

// Folder repository interface
export interface IFolderRepository extends IBaseRepository<TFolder> {
	findByParentId(parentId: number | null): Promise<TFolder[]>
	findChildren(folderId: number): Promise<TFolder[]>
	move(folderId: number, newParentId: number | null, position: number): Promise<TFolder>
	findFavorites(): Promise<TFolder[]>
	findPublic(): Promise<TFolder[]>
	search(query: string): Promise<TFolder[]>
}

// Note repository interface
export interface INoteRepository extends IBaseRepository<TNote> {
	findByFolderId(folderId: number): Promise<TNote[]>
	findFavorites(): Promise<TNote[]>
	findPublic(): Promise<TNote[]>
	search(query: string): Promise<TNote[]>
	move(noteId: number, folderId: number | null): Promise<TNote>
}

// Workspace repository interface
export interface IWorkspaceRepository {
	getStats(): Promise<TWorkspaceStats>
	search(query: string, type?: 'folder' | 'note' | 'all'): Promise<TWorkspaceItem[]>
	getFavorites(): Promise<TWorkspaceItem[]>
	getPublic(): Promise<TWorkspaceItem[]>
	getRecent(limit?: number): Promise<TWorkspaceItem[]>
}
