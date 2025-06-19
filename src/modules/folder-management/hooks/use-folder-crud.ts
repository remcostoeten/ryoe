import { createHierarchicalCrud } from "@/factories/crud-factory"
import { TMutationHandlers } from "@/factories/crud-types"
import { TFolder } from "../types"

function createFolderCrud(mutations: TMutationHandlers<TFolder>) {
  return createHierarchicalCrud<TFolder>(
    {
      entityName: "folder",
      tempIdPrefix: "temp-folder",
      defaultValues: {
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

export function useFolderCrud(
  folders: TFolder[],
  onFoldersChange: (folders: TFolder[]) => void,
  mutations: TMutationHandlers<TFolder>,
) {
  const folderCrud = createFolderCrud(mutations)
  return folderCrud(folders, onFoldersChange)
}
