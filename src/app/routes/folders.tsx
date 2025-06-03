import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, RefreshCw, TestTube } from 'lucide-react'
import {
  FolderTree,
  FolderCreateForm,
  useFolderTree,
  useFolderOperations
} from '@/modules/folder-management'
import { testFolderCRUD } from '@/test-folder-crud'
import type { Folder } from '@/types/notes'

export default function FoldersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  
  const {
    treeData,
    expandedIds,
    selectedId,
    loading,
    error,
    expandFolder,
    collapseFolder,
    selectFolder,
    refreshTree
  } = useFolderTree()

  const handleFolderSelect = (folder: Folder) => {
    selectFolder(folder.id)
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

  const handleRefresh = () => {
    refreshTree()
  }

  const handleRunTests = async () => {
    console.log('Running folder CRUD tests...')
    await testFolderCRUD()
    // Refresh the tree after tests
    refreshTree()
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
                onFolderSelect={handleFolderSelect}
                onFolderExpand={handleFolderExpand}
                onFolderCreate={handleCreateFolder}
                enableDragDrop={false}
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
          {selectedId && (
            <Card>
              <CardHeader>
                <CardTitle>Folder Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {selectedId}
                  </div>
                  {/* Add more folder details here */}
                </div>
              </CardContent>
            </Card>
          )}

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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
