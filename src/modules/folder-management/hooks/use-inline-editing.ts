import { useState, useCallback, useRef, useEffect } from 'react'
import type { InlineEditState } from '../types'

interface UseInlineEditingProps {
  onSave: (newValue: string) => Promise<boolean>
  onCancel?: () => void
  validateValue?: (value: string) => string | null
  initialValue: string
}

export function useInlineEditing({
  onSave,
  onCancel,
  validateValue,
  initialValue
}: UseInlineEditingProps) {
  const [state, setState] = useState<InlineEditState>({
    isEditing: false,
    originalValue: initialValue,
    currentValue: initialValue,
    isValid: true
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Update initial value when it changes
  useEffect(() => {
    if (!state.isEditing) {
      setState(prev => ({
        ...prev,
        originalValue: initialValue,
        currentValue: initialValue
      }))
    }
  }, [initialValue, state.isEditing])

  const startEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: true,
      currentValue: prev.originalValue,
      isValid: true,
      error: undefined
    }))
  }, [])

  const stopEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false,
      currentValue: prev.originalValue,
      isValid: true,
      error: undefined
    }))
    
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  const updateValue = useCallback((newValue: string) => {
    const error = validateValue ? validateValue(newValue) : null
    
    setState(prev => ({
      ...prev,
      currentValue: newValue,
      isValid: !error,
      error: error || undefined
    }))
  }, [validateValue])

  const saveValue = useCallback(async () => {
    if (!state.isValid || isSaving) return false

    const trimmedValue = state.currentValue.trim()
    
    // Don't save if value hasn't changed
    if (trimmedValue === state.originalValue) {
      stopEditing()
      return true
    }

    // Validate one more time
    const error = validateValue ? validateValue(trimmedValue) : null
    if (error) {
      setState(prev => ({
        ...prev,
        isValid: false,
        error
      }))
      return false
    }

    setIsSaving(true)
    
    try {
      const success = await onSave(trimmedValue)
      
      if (success) {
        setState(prev => ({
          ...prev,
          isEditing: false,
          originalValue: trimmedValue,
          currentValue: trimmedValue,
          isValid: true,
          error: undefined
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          isValid: false,
          error: 'Failed to save changes'
        }))
        return false
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [state, isSaving, validateValue, onSave, stopEditing])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        e.stopPropagation()
        saveValue()
        break

      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        stopEditing()
        break

      case 'Tab':
        // Allow tab to work normally but save first
        saveValue()
        break
    }
  }, [saveValue, stopEditing])

  const handleBlur = useCallback(() => {
    // Small delay to allow click events to fire first
    setTimeout(() => {
      if (state.isEditing) {
        saveValue()
      }
    }, 100)
  }, [state.isEditing, saveValue])

  // Focus input when editing starts
  useEffect(() => {
    if (state.isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [state.isEditing])

  return {
    ...state,
    isSaving,
    inputRef,
    startEditing,
    stopEditing,
    updateValue,
    saveValue,
    handleKeyDown,
    handleBlur
  }
}

// Default validation function for folder names
export function validateFolderName(name: string): string | null {
  const trimmed = name.trim()
  
  if (!trimmed) {
    return 'Folder name cannot be empty'
  }
  
  if (trimmed.length > 100) {
    return 'Folder name must be less than 100 characters'
  }
  
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(trimmed)) {
    return 'Folder name contains invalid characters'
  }
  
  // Check for reserved names
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  if (reservedNames.includes(trimmed.toUpperCase())) {
    return 'This name is reserved and cannot be used'
  }
  
  return null
}
