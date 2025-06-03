import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { Plus, RefreshCw, TestTube } from 'lucide-react'
import {
  FolderTree,
  FolderCreateForm,
  useFolderTree,
  useFolderOperations
} from '@/modules/folder-management'
import { testFolderCRUD } from '@/__tests__/test-folder-crud'
import type { Folder } from '@/types/notes'

// Helper function to get all folders from tree structure
function getAllFolders(folder: any): any[] {
  const result = [folder]
  if (folder.children) {
    folder.children.forEach((child: any) => {
      result.push(...getAllFolders(child))
    })
  }
  return result
}

export default function FoldersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  
  const {
    treeData,
    expandedIds,
    selectedId,
    editingId,
    loading,
    error,
    expandFolder,
    collapseFolder,
    selectFolder,
    startEditing,
    stopEditing,
    renameFolder,
    refreshTree
  } = useFolderTree()

  const { moveFolder } = useFolderOperations()

  const handleFolderSelect = (folder: Folder) => {
    selectFolder(folder.id)
  }

  const handleFolderMove = async (folderId: number, newParentId: number | null, newPosition: number) => {
    try {
      await moveFolder(folderId, newParentId, newPosition)
      toast.success('Folder moved successfully')
    } catch (error) {
      toast.error('Failed to move folder')
      console.error('Move folder error:', error)
    }
  }

  const handleFolderExpand = (folderId: number, isExpanded: boolean) => {
    if (isExpanded) {
      expandFolder(folderId)
    } else {
      collapseFolder(folderId)
    }
  }

  const handleCreateFolder = (parentId: number | null = null) => {
    setSelectedParentId(parentId)
    setShowCreateForm(true)
  }

  const handleCreateSuccess = (folder: Folder) => {
    setShowCreateForm(false)
    setSelectedParentId(null)
    refreshTree()
    selectFolder(folder.id)
  }

  const handleCreateCancel = () => {
    setShowCreateForm(false)
    setSelectedParentId(null)
  }

  const handleRefresh = async () => {
    try {
      await refreshTree()
      toast.success('Folder tree refreshed')
    } catch (error) {
      toast.error('Failed to refresh folder tree')
    }
  }

  const handleRunTests = async () => {
    console.log('Running folder CRUD tests...')
    await testFolderCRUD()
    // Refresh the tree after tests
    await handleRefresh()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading folders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Folder Management</h1>
          <p className="text-muted-foreground">
            Organize your notes with folders and subfolders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunTests}
            disabled={loading}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Run Tests
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => handleCreateFolder()}
            disabled={showCreateForm}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Error loading folders</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folder Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Folder Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderTree
                folders={treeData}
                selectedFolderId={selectedId}
                expandedFolderIds={expandedIds}
                editingFolderId={editingId}
                onFolderSelect={handleFolderSelect}
                onFolderExpand={handleFolderExpand}
                onFolderCreate={handleCreateFolder}
                onFolderRename={renameFolder}
                onFolderMove={async (folderId, newParentId, newPosition) => {
                  // Handle folder move without immediate refresh to prevent DOM reload
                  try {
                    await handleFolderMove(folderId, newParentId, newPosition)
                    // Only refresh on success, and do it after a delay to prevent DOM reload
                    setTimeout(() => {
                      refreshTree()
                    }, 500)
                  } catch (error) {
                    console.error('Failed to move folder:', error)
                    // Refresh immediately on error to revert state
                    refreshTree()
                  }
                }}
                onStartEditing={startEditing}
                onStopEditing={stopEditing}
                enableDragDrop={true}
                enableKeyboardNavigation={true}
                showContextMenu={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Create Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedParentId ? 'Create Subfolder' : 'Create New Folder'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FolderCreateForm
                  parentId={selectedParentId}
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCreateCancel}
                />
              </CardContent>
            </Card>
          )}

          {/* Selected Folder Info */}
          {selectedId && (() => {
            const selectedFolder = treeData.find(f => f.id === selectedId) ||
              treeData.flatMap(f => getAllFolders(f)).find(f => f.id === selectedId)

            if (!selectedFolder) return null

            const siblings = treeData.filter(f => f.parentId === selectedFolder.parentId && f.id !== selectedFolder.id)
            const parent = selectedFolder.parentId ?
              treeData.flatMap(f => getAllFolders(f)).find(f => f.id === selectedFolder.parentId) : null

            return (
              <Card>
                <CardHeader>
                  <CardTitle>Folder Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedFolder.name}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> {selectedFolder.id}
                    </div>
                    <div>
                      <span className="font-medium">Privacy:</span>{' '}
                      <span className={selectedFolder.isPublic ? 'text-green-600' : 'text-orange-600'}>
                        {selectedFolder.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Parent:</span>{' '}
                      {parent ? parent.name : 'Root'}
                    </div>
                    <div>
                      <span className="font-medium">Children:</span> {selectedFolder.children?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Siblings:</span> {siblings.length}
                      {siblings.length > 0 && (
                        <div className="mt-1 ml-2 text-xs text-muted-foreground">
                          {siblings.map(sibling => sibling.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Depth:</span> {selectedFolder.depth}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Folders:</span>
                  <span className="font-medium">{treeData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expanded:</span>
                  <span className="font-medium">{expandedIds.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span className="font-medium">{selectedId ? 'Yes' : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Editing:</span>
                  <span className="font-medium">{editingId ? 'Yes' : 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">↑↓</span>
                  <span>Navigate</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">→</span>
                  <span>Expand</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">←</span>
                  <span>Collapse</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">Enter</span>
                  <span>Select</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">F2</span>
                  <span>Rename</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">Insert</span>
                  <span>New Child</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">Delete</span>
                  <span>Delete</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">*</span>
                  <span>Expand All</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">Double-click</span>
                  <span>Rename</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
