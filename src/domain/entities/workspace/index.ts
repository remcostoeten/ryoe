// Domain entities for workspace - Single source of truth
export type TBaseEntity = {
	id: number
	createdAt: Date
	updatedAt: Date
	position: number
	isFavorite: boolean
	isPublic: boolean
}

// Folder domain entity
export type TFolder = TBaseEntity & {
	type: 'folder'
	name: string
	parentId: number | null
	children?: TFolder[]
	depth?: number
	hasChildren?: boolean
	isTemp?: boolean
}

// Note domain entity
export type TNote = TBaseEntity & {
	type: 'note'
	title: string
	content: string
	folderId: number | null
}

// Extended types with metadata
export type TFolderWithStats = TFolder & {
	noteCount?: number
	childCount?: number
	path?: string[]
	isExpanded?: boolean
}

export type TNoteWithMetadata = TNote & {
	folderPath?: string
	wordCount?: number
	lastModified?: string
}

// User types
export interface TUserProfile {
	id: number
	name: string
	snippetsPath: string
	isSetupComplete: boolean
	storageType: 'local' | 'turso'
	preferences: TUserPreferences
	createdAt: Date
	updatedAt: Date
}

export interface TUserPreferences {
	theme: 'light' | 'dark' | 'system'
	sidebarCollapsed: boolean
	autoSave: boolean
	showLineNumbers: boolean
	fontSize: number
	editorTheme: string
}

// Creation and update data types
export interface TCreateFolderData {
	name: string
	parentId?: number | null
	position?: number
}

export interface TUpdateFolderData {
	name?: string
	parentId?: number | null
	position?: number
	isExpanded?: boolean
	isFavorite?: boolean
}

export interface TCreateNoteData {
	title: string
	content?: string
	folderId?: number | null
	position?: number
	isPublic?: boolean
}

export interface TNoteUpdateData {
	title?: string
	content?: string
	folderId?: number | null
	position?: number
	isPublic?: boolean
	isFavorite?: boolean
}

export interface TNoteCreationData extends TCreateNoteData { }

export interface TCreateUserData {
	name: string
	snippetsPath: string
	storageType: 'local' | 'turso'
	preferences?: Partial<TUserPreferences>
}

export interface TUpdateUserData extends Partial<TCreateUserData> { }

// Search types
export interface TSearchOptions {
	query: string
	folderId?: number | null
	includeContent?: boolean
	caseSensitive?: boolean
	limit?: number
	offset?: number
}

export interface TSearchResult {
	notes: TNoteWithMetadata[]
	total: number
	hasMore: boolean
}

// UI State types
export interface TDragState {
	isDragging: boolean
	draggedItem: TWorkspaceItem | null
	draggedOverItem: TWorkspaceItem | null
	dropPosition: 'above' | 'below' | 'inside' | null
}

export interface TContextMenuState {
	isOpen: boolean
	item: TWorkspaceItem | null
	position: { x: number; y: number }
}

export interface TFolderSidebarProps {
	folders: TFolderWithStats[]
	notes: TNoteWithMetadata[]
	onFolderClick: (folder: TFolderWithStats) => void
	onNoteClick: (note: TNoteWithMetadata) => void
	onFolderCreate: (parentId?: number) => void
	onNoteCreate: (folderId?: number) => void
	onFolderEdit: (folder: TFolderWithStats) => void
	onNoteEdit: (note: TNoteWithMetadata) => void
	onFolderDelete: (folder: TFolderWithStats) => void
	onNoteDelete: (note: TNoteWithMetadata) => void
	showNotes?: boolean
	enableDragDrop?: boolean
}

// Service result type
export interface TServiceResult<T = any> {
	success: boolean
	data?: T
	error?: string
	message?: string
	code?: string // Error/success codes for better error handling
}

// Workspace item union
export type TWorkspaceItem = TFolder | TNote

// Value objects
export type TWorkspaceStats = {
	totalFolders: number
	totalNotes: number
	totalItems: number
	favoriteItems: number
	publicItems: number
}

// Domain events
export type TWorkspaceEvent =
	| { type: 'FOLDER_CREATED'; payload: TFolder }
	| { type: 'FOLDER_UPDATED'; payload: TFolder }
	| { type: 'FOLDER_DELETED'; payload: { id: number } }
	| { type: 'NOTE_CREATED'; payload: TNote }
	| { type: 'NOTE_UPDATED'; payload: TNote }
	| { type: 'NOTE_DELETED'; payload: { id: number } }
