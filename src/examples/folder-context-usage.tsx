/**
 * Example usage of the integrated FolderContext
 * This demonstrates how to use the enterprise-grade folder management system
 */

import React from 'react'
import { FolderProvider, useFolderContext } from '@/contexts/folder-context'
import { FolderTree } from '@/modules/folder-management/components/folder-tree'
import { FolderCreateForm } from '@/modules/folder-management/components/folder-create-form'

// Example component that uses the folder context
function FolderManagementPanel() {
  const {
    // Data
    folders,
    treeData,
    loading,
    error,
    
    // UI State
    selectedFolderId,
    expandedFolderIds,
    editingFolderId,
    searchFilter,
    
    // Operations
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders,
    
    // Tree operations
    selectFolder,
    expandFolder,
    collapseFolder,
    toggleFolder,
    startEditing,
    stopEditing,
    renameFolder,
    
    // Search
    setSearchFilter,
    filteredFolders,
    filteredTreeData
  } = useFolderContext()

  const handleCreateFolder = async (name: string, parentId?: number | null) => {
    const result = await createFolder({
      name,
      parentId: parentId || null
    })
    
    if (result) {
      console.log('Folder created:', result)
    }
  }

  const handleDeleteFolder = async (folderId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this folder?')
    if (confirmed) {
      const success = await deleteFolder(folderId, false) // Don't delete children
      if (success) {
        console.log('Folder deleted successfully')
      }
    }
  }

  const handleRenameFolder = async (folderId: number, newName: string) => {
    const success = await renameFolder(folderId, newName)
    if (success) {
      stopEditing()
      console.log('Folder renamed successfully')
    }
  }

  if (loading) {
    return <div className="p-4">Loading folders...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>Error: {error}</p>
        <button 
          onClick={refreshFolders}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search folders..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Create Folder Form */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Create New Folder</h3>
        <FolderCreateForm
          parentId={selectedFolderId}
          onSuccess={(folder) => {
            console.log('Folder created via form:', folder)
          }}
          onCancel={() => {
            console.log('Folder creation cancelled')
          }}
        />
      </div>

      {/* Folder Tree */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Folder Tree</h3>
          <div className="space-x-2">
            <button
              onClick={refreshFolders}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh
            </button>
            <button
              onClick={() => handleCreateFolder('New Folder')}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Quick Add
            </button>
          </div>
        </div>

        <FolderTree
          folders={searchFilter ? filteredTreeData : treeData}
          selectedFolderId={selectedFolderId}
          expandedFolderIds={expandedFolderIds}
          editingFolderId={editingFolderId}
          onFolderSelect={(folder) => selectFolder(folder.id)}
          onFolderExpand={(folderId, isExpanded) => {
            if (isExpanded) {
              expandFolder(folderId)
            } else {
              collapseFolder(folderId)
            }
          }}
          onFolderCreate={(parentId) => {
            const name = prompt('Enter folder name:')
            if (name) {
              handleCreateFolder(name, parentId)
            }
          }}
          onFolderEdit={(folder) => {
            console.log('Edit folder:', folder)
          }}
          onFolderRename={handleRenameFolder}
          onFolderDelete={(folder) => handleDeleteFolder(folder.id)}
          onStartEditing={startEditing}
          onStopEditing={stopEditing}
          enableDragDrop={true}
          enableKeyboardNavigation={true}
          showContextMenu={true}
        />
      </div>

      {/* Debug Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">Debug Info</h4>
        <div className="text-sm space-y-1">
          <p>Total folders: {folders.length}</p>
          <p>Filtered folders: {filteredFolders.length}</p>
          <p>Selected folder: {selectedFolderId || 'None'}</p>
          <p>Expanded folders: {expandedFolderIds.size}</p>
          <p>Editing folder: {editingFolderId || 'None'}</p>
          <p>Search filter: "{searchFilter}"</p>
        </div>
      </div>
    </div>
  )
}

// Main app component with provider
export function FolderManagementApp() {
  return (
    <FolderProvider parentId={null}>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">Folder Management System</h1>
          <FolderManagementPanel />
        </div>
      </div>
    </FolderProvider>
  )
}

// Example of using the context for a specific parent folder
export function SubfolderManagement({ parentFolderId }: { parentFolderId: number }) {
  return (
    <FolderProvider parentId={parentFolderId}>
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Subfolders</h3>
        <FolderManagementPanel />
      </div>
    </FolderProvider>
  )
}

export default FolderManagementApp
