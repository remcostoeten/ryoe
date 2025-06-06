import React, { useState } from 'react'
import { FolderOpen, Loader2 } from 'lucide-react'
import { cn } from '@/utilities/styling'
import { openMdxDirectoryPicker, validateMdxPath } from '@/utilities/file-picker'

interface DirectoryPickerProps {
  value: string
  onChange: (path: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  label?: string
  error?: string
}

export function DirectoryPicker({
  value,
  onChange,
  placeholder = '~/.config/ryoe',
  disabled = false,
  className,
  label,
  error
}: DirectoryPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [validationError, setValidationError] = useState<string>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value
    onChange(newPath)
    
    // Validate the path
    const validation = validateMdxPath(newPath)
    setValidationError(validation.valid ? undefined : validation.error)
  }

  const handleBrowseClick = async () => {
    if (disabled || isPickerOpen) return

    setIsPickerOpen(true)
    try {
      const result = await openMdxDirectoryPicker(value)
      
      if (result.success && result.path) {
        onChange(result.path)
        setValidationError(undefined)
      } else if (result.error && result.error !== 'User cancelled selection') {
        setValidationError(result.error)
      }
    } catch (error) {
      console.error('Directory picker error:', error)
      setValidationError('Failed to open directory picker')
    } finally {
      setIsPickerOpen(false)
    }
  }

  const displayError = error || validationError

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FolderOpen className="h-5 w-5" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full bg-gray-800 text-gray-200 border rounded-lg py-3 pl-10 pr-24 focus:outline-none transition-colors',
            displayError
              ? 'border-red-500 focus:border-red-400'
              : 'border-gray-600 focus:border-emerald-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        
        <button
          type="button"
          onClick={handleBrowseClick}
          disabled={disabled || isPickerOpen}
          className={cn(
            'absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded transition-colors',
            'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800'
          )}
        >
          {isPickerOpen ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Opening...
            </>
          ) : (
            'Browse'
          )}
        </button>
      </div>
      
      {displayError && (
        <p className="text-sm text-red-400 mt-1">
          {displayError}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Choose where to store your MDX files. You can type a path or click Browse to select a directory.
      </p>
    </div>
  )
}

// Onboarding-specific variant with different styling
export function OnboardingDirectoryPicker({
  value,
  onChange,
  placeholder = '~/.config/ryoe',
  disabled = false,
  className,
  label,
  error
}: DirectoryPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [validationError, setValidationError] = useState<string>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value
    onChange(newPath)
    
    const validation = validateMdxPath(newPath)
    setValidationError(validation.valid ? undefined : validation.error)
  }

  const handleBrowseClick = async () => {
    if (disabled || isPickerOpen) return

    setIsPickerOpen(true)
    try {
      const result = await openMdxDirectoryPicker(value)
      
      if (result.success && result.path) {
        onChange(result.path)
        setValidationError(undefined)
      } else if (result.error && result.error !== 'User cancelled selection') {
        setValidationError(result.error)
      }
    } catch (error) {
      console.error('Directory picker error:', error)
      setValidationError('Failed to open directory picker')
    } finally {
      setIsPickerOpen(false)
    }
  }

  const displayError = error || validationError

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-white/80 text-sm font-medium text-left">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
          <FolderOpen className="h-5 w-5" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full backdrop-blur-[1px] text-white border-1 rounded-full py-3 pl-12 pr-24 focus:outline-none transition-colors',
            displayError
              ? 'border-red-400/50 focus:border-red-400'
              : 'border-white/10 focus:border-white/30'
          )}
        />
        
        <button
          type="button"
          onClick={handleBrowseClick}
          disabled={disabled || isPickerOpen}
          className={cn(
            'absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
            'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-white/30'
          )}
        >
          {isPickerOpen ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Opening...
            </>
          ) : (
            'Browse'
          )}
        </button>
      </div>
      
      {displayError && (
        <p className="text-sm text-red-400/80 mt-1">
          {displayError}
        </p>
      )}
    </div>
  )
}
