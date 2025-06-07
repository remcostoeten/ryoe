/**
 * Test page to verify the AppSidebar integration with FolderContext
 */

import React from 'react'
import { useFolderContext } from '@/modules/folder-management'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Folder, FileText, Search, Plus } from 'lucide-react'

export function Component() {
  const {
    // Data
    folders,
    treeData,
    loading,
    error,
    
    // UI State
    selectedFolderId,
    expandedFolderIds,
    searchFilter,
    
    // Operations
    createFolder,
    selectFolder,
    toggleFolder,
    setSearchFilter,
    
    // Filtered data
    filteredFolders,
    filteredTreeData
  } = useFolderContext()

  const handleCreateTestFolder = async () => {
    const name = `Test Folder ${Date.now()}`
    await createFolder({
      name,
      parentId: selectedFolderId // Use selected folder as parent
    })
  }

  const handleCreateSubfolder = async (parentId: number) => {
    const name = `Subfolder ${Date.now()}`
    await createFolder({
      name,
      parentId
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sidebar Integration Test</h1>
        <p className="text-muted-foreground">
          Testing the AppSidebar integration with the enterprise FolderContext
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCreateTestFolder}>
              <Folder className="h-4 w-4 mr-2" />
              {selectedFolderId ? 'Create Child Folder' : 'Create Root Folder'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSearchFilter(searchFilter ? '' : 'test')}
            >
              <Search className="h-4 w-4 mr-2" />
              {searchFilter ? 'Clear Search' : 'Search "test"'}
            </Button>
            {selectedFolderId && (
              <Button
                variant="outline"
                onClick={() => selectFolder(null)}
              >
                Clear Selection
              </Button>
            )}
          </div>
          
          {searchFilter && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Current search: <Badge variant="secondary">{searchFilter}</Badge>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Context State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Folder Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>Total folders: <Badge>{folders.length}</Badge></p>
              <p>Tree nodes: <Badge>{treeData.length}</Badge></p>
              <p>Filtered folders: <Badge>{filteredFolders.length}</Badge></p>
              <p>Filtered tree: <Badge>{filteredTreeData.length}</Badge></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UI State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>Selected folder: <Badge variant="outline">{selectedFolderId || 'None'}</Badge></p>
              <p>Expanded folders: <Badge variant="outline">{expandedFolderIds.size}</Badge></p>
              <p>Search filter: <Badge variant="outline">{searchFilter || 'None'}</Badge></p>
              <p>Loading: <Badge variant={loading ? 'destructive' : 'secondary'}>{loading ? 'Yes' : 'No'}</Badge></p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => console.log('Current context state:', {
                  folders,
                  treeData,
                  selectedFolderId,
                  expandedFolderIds: Array.from(expandedFolderIds),
                  searchFilter
                })}
              >
                Log State to Console
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  expandedFolderIds.clear()
                  setSearchFilter('')
                  selectFolder(null)
                }}
              >
                Reset UI State
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folder List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Folder Tree (from Context)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treeData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No folders yet. Create one using the sidebar or the button above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(searchFilter ? filteredTreeData : treeData).map((folder) => (
                <div
                  key={folder.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectFolder(folder.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFolder(folder.id)
                        }}
                      >
                        {expandedFolderIds.has(folder.id) ? '−' : '+'}
                      </Button>
                      <Folder className="h-4 w-4" />
                      <span className="font-medium">{folder.name}</span>
                      {folder.children.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {folder.children.length}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCreateSubfolder(folder.id)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {expandedFolderIds.has(folder.id) && folder.children.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {folder.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded"
                        >
                          <Folder className="h-3 w-3" />
                          <span>{child.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Component
