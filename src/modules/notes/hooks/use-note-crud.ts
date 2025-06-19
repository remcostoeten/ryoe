import { createCrudOperations } from "@/factories/crud-factory"
import type { TNote } from "@/modules/folder-management/types"
import type { TMutationHandlers } from "@/factories/crud-types"

function createNoteCrud(mutations: TMutationHandlers<TNote>) {
    return createCrudOperations<TNote>(
        {
            entityName: "note",
            tempIdPrefix: "temp-note",
            defaultValues: {
                title: "Untitled",
                content: "",
                folderId: null,
                position: 0,
                isFavorite: false,
                isPublic: false,
            },
            validationRules: (note) => note.title.trim().length > 0,
        },
        mutations,
    )
}

export function useNoteCrud(
    notes: TNote[],
    onNotesChange: (notes: TNote[]) => void,
    mutations: TMutationHandlers<TNote>,
) {
    const noteCrud = createNoteCrud(mutations)
    return noteCrud(notes, onNotesChange)
}