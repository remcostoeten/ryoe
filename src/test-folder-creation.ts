/**
 * Test script to debug folder creation issues
 */

import { createFolderWithValidation } from '@/services/folder-service'
import { checkDatabaseHealth, initializeDatabase } from '@/api/db'

export async function testFolderCreation() {
  console.log('=== Testing Folder Creation ===')

  try {
    // 1. Check database health
    console.log('1. Checking database health...')
    const health = await checkDatabaseHealth()
    console.log('Database health:', health)

    if (health.status !== 'healthy') {
      console.error('Database is not healthy, attempting to initialize...')
      await initializeDatabase()

      // Check again
      const healthAfterInit = await checkDatabaseHealth()
      console.log('Database health after init:', healthAfterInit)

      if (healthAfterInit.status !== 'healthy') {
        throw new Error('Database initialization failed')
      }
    }

    // 2. Test folder creation
    console.log('2. Testing folder creation...')
    const result = await createFolderWithValidation({
      name: 'Test Folder',
      parentId: undefined
    })

    console.log('Folder creation result:', result)

    if (result.success) {
      console.log('✅ Folder creation test passed!')
      return result.data
    } else {
      console.error('❌ Folder creation test failed:', result.error)
      return null
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return null
  }
}

// Test with a parent folder
export async function testChildFolderCreation(parentId: number) {
  console.log('=== Testing Child Folder Creation ===')

  try {
    const result = await createFolderWithValidation({
      name: 'Test Child Folder',
      parentId
    })

    console.log('Child folder creation result:', result)

    if (result.success) {
      console.log('✅ Child folder creation test passed!')
      return result.data
    } else {
      console.error('❌ Child folder creation test failed:', result.error)
      return null
    }

  } catch (error) {
    console.error('❌ Child folder test failed with error:', error)
    return null
  }
}

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testFolderCreation = testFolderCreation
  // Comment out the problematic testChildFolderCreation assignment
  // (window as any).testChildFolderCreation = testChildFolderCreation
}
