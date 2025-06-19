import { createHierarchicalCrud } from "@/factories/crud-factory"
import type { TMutationHandlers } from "@/factories/crud-types"
import type { TFolder, TNote } from "@/domain/entities/workspace"

// Folder CRUD configuration
export function createFolderCrud(mutations: TMutationHandlers<TFolder>) {
    return createHierarchicalCrud<TFolder>(
        {
            entityName: "folder",
            tempIdPrefix: "temp-folder",
            defaultValues: {
                type: 'folder' as const,
                name: "New Folder",
                parentId: null,
                position: 0,
                isFavorite: false,
                isPublic: false,
                children: [],
            },
            validationRules: (folder) => folder.name.trim().length > 0,
            onSuccess: (action, folder) => {
                console.log(`Folder ${action} successful:`, folder.name)
            },
            onError: (action, error) => {
                console.error(`Folder ${action} failed:`, error.message)
            },
        },
        mutations,
    )
}

// Note CRUD configuration
export function createNoteCrud(mutations: TMutationHandlers<TNote>) {
    return createHierarchicalCrud<TNote>(
        {
            entityName: "note",
            tempIdPrefix: "temp-note",
            defaultValues: {
                type: 'note' as const,
                title: "Untitled",
                content: "",
                folderId: null,
                position: 0,
                isFavorite: false,
                isPublic: false,
            },
            validationRules: (note) => note.title.trim().length > 0,
            onSuccess: (action, note) => {
                console.log(`Note ${action} successful:`, note.title)
            },
            onError: (action, error) => {
                console.error(`Note ${action} failed:`, error.message)
            },
        },
        mutations,
    )
} 