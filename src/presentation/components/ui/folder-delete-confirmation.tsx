
import { AlertTriangle, Folder, FileText } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type TFolderDeleteConfirmationProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  folderName: string
  childFoldersCount?: number
  notesCount?: number
  isLoading?: boolean
}

export function FolderDeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  folderName,
  childFoldersCount = 0,
  notesCount = 0,
  isLoading = false
}: TFolderDeleteConfirmationProps) {
  const hasChildren = childFoldersCount > 0 || notesCount > 0

  function handleConfirm() {
    onConfirm()
  }

  function handleCancel() {
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-left">
                Delete Folder
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete the folder{" "}
            <span className="font-medium text-foreground">"{folderName}"</span>?
          </AlertDialogDescription>

          {hasChildren && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    This folder contains:
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {childFoldersCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Folder className="h-3 w-3" />
                        <span>
                          {childFoldersCount} subfolder{childFoldersCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {notesCount > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        <span>
                          {notesCount} note{notesCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-destructive">
                    All contents will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Folder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
