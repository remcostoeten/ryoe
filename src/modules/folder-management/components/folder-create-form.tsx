import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useFolderOperations } from '../hooks/use-folder-operations'
import type { FolderCreateFormProps } from '../types'
import type { CreateFolderInput } from '@/types/notes'

export function FolderCreateForm({
  parentId = null,
  onSuccess,
  onCancel,
  className
}: FolderCreateFormProps) {
  const [formData, setFormData] = useState<CreateFolderInput>({
    name: '',
    parentId,
    isPublic: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { createFolder, loading, error } = useFolderOperations()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Folder name is required'
    } else if (formData.name.trim().length < 1) {
      newErrors.name = 'Folder name must be at least 1 character'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Folder name must be less than 100 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const result = await createFolder({
      ...formData,
      name: formData.name.trim()
    })

    if (result) {
      // Reset form
      setFormData({
        name: '',
        parentId,
        isPublic: false
      })
      setErrors({})
      
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      parentId,
      isPublic: false
    })
    setErrors({})
    
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="folder-name">Folder Name</Label>
        <Input
          id="folder-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter folder name..."
          className={cn(errors.name && "border-destructive")}
          disabled={loading}
          autoFocus
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-public"
          checked={formData.isPublic}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, isPublic: Boolean(checked) }))
          }
          disabled={loading}
        />
        <Label htmlFor="is-public" className="text-sm">
          Make this folder public
        </Label>
      </div>

      {parentId && (
        <div className="text-sm text-muted-foreground">
          This folder will be created as a subfolder.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Creating...' : 'Create Folder'}
        </Button>
      </div>
    </form>
  )
}
