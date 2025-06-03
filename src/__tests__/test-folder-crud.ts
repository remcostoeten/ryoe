// Test script for folder CRUD operations
import { FolderService } from '@/api/services/folder-service'
import { toast } from '@/components/ui/toast'

async function testFolderCRUD() {
  const folderService = new FolderService()

  console.log('🧪 Testing Folder CRUD Operations...')
  toast.info('Running folder CRUD tests...')

  try {
    // Test 1: Create a root folder
    console.log('\n1. Creating root folder...')
    const rootFolder = await folderService.create({
      name: 'My Documents',
      isPublic: false
    })
    
    if (rootFolder.success && rootFolder.data) {
      console.log('✅ Root folder created:', rootFolder.data)
    } else {
      console.error('❌ Failed to create root folder:', rootFolder.error)
      return
    }
    
    // Test 2: Create a subfolder
    console.log('\n2. Creating subfolder...')
    const subFolder = await folderService.create({
      name: 'Projects',
      parentId: rootFolder.data.id,
      isPublic: true
    })
    
    if (subFolder.success && subFolder.data) {
      console.log('✅ Subfolder created:', subFolder.data)
    } else {
      console.error('❌ Failed to create subfolder:', subFolder.error)
      return
    }
    
    // Test 3: List all folders
    console.log('\n3. Listing all folders...')
    const allFolders = await folderService.list()
    
    if (allFolders.success && allFolders.data) {
      console.log('✅ All folders:', allFolders.data)
    } else {
      console.error('❌ Failed to list folders:', allFolders.error)
    }
    
    // Test 4: Get children of root folder
    console.log('\n4. Getting children of root folder...')
    const children = await folderService.getChildren(rootFolder.data.id)
    
    if (children.success && children.data) {
      console.log('✅ Root folder children:', children.data)
    } else {
      console.error('❌ Failed to get children:', children.error)
    }
    
    // Test 5: Update folder name
    console.log('\n5. Updating folder name...')
    const updatedFolder = await folderService.update({
      id: subFolder.data.id,
      name: 'Work Projects'
    })
    
    if (updatedFolder.success && updatedFolder.data) {
      console.log('✅ Folder updated:', updatedFolder.data)
    } else {
      console.error('❌ Failed to update folder:', updatedFolder.error)
    }
    
    // Test 6: Create another subfolder for testing move
    console.log('\n6. Creating another subfolder...')
    const anotherSubFolder = await folderService.create({
      name: 'Personal',
      parentId: rootFolder.data.id,
      isPublic: false
    })
    
    if (anotherSubFolder.success && anotherSubFolder.data) {
      console.log('✅ Another subfolder created:', anotherSubFolder.data)
    } else {
      console.error('❌ Failed to create another subfolder:', anotherSubFolder.error)
    }
    
    // Test 7: Move folder (change parent)
    console.log('\n7. Moving folder...')
    const movedFolder = await folderService.move(
      anotherSubFolder.data!.id,
      subFolder.data.id,
      0
    )
    
    if (movedFolder.success && movedFolder.data) {
      console.log('✅ Folder moved:', movedFolder.data)
    } else {
      console.error('❌ Failed to move folder:', movedFolder.error)
    }
    
    // Test 8: Get folder tree structure
    console.log('\n8. Final folder structure...')
    const finalFolders = await folderService.list()
    
    if (finalFolders.success && finalFolders.data) {
      console.log('✅ Final folder structure:')
      finalFolders.data.forEach(folder => {
        const indent = '  '.repeat((folder.parentId ? 1 : 0))
        console.log(`${indent}- ${folder.name} (ID: ${folder.id}, Parent: ${folder.parentId || 'root'})`)
      })
    }
    
    console.log('\n🎉 All tests completed successfully!')
    toast.success('All folder CRUD tests completed successfully!')

  } catch (error) {
    console.error('💥 Test failed with error:', error)
    toast.error('Folder CRUD tests failed. Check console for details.')
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testFolderCRUD = testFolderCRUD
}

export { testFolderCRUD }
