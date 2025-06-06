import { useState } from 'react'
import { DirectoryPicker, OnboardingDirectoryPicker } from '@/components/ui/directory-picker'

export function DirectoryPickerDemo() {
  const [regularPath, setRegularPath] = useState('~/.config/ryoe')
  const [onboardingPath, setOnboardingPath] = useState('~/.config/ryoe')

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Directory Picker Demo</h2>
        <p className="text-gray-600 mb-6">
          Test the directory picker components in both regular and onboarding styles.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Regular Directory Picker</h3>
          <DirectoryPicker
            label="Choose Directory"
            value={regularPath}
            onChange={setRegularPath}
            placeholder="Select a directory..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Selected: <code className="bg-gray-100 px-2 py-1 rounded">{regularPath}</code>
          </p>
        </div>

        <div className="bg-black p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">Onboarding Directory Picker</h3>
          <OnboardingDirectoryPicker
            label="MDX Storage Location"
            value={onboardingPath}
            onChange={setOnboardingPath}
            placeholder="~/.config/ryoe"
          />
          <p className="text-sm text-gray-400 mt-2">
            Selected: <code className="bg-gray-800 px-2 py-1 rounded text-white">{onboardingPath}</code>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Tauri Desktop:</strong> Uses native file picker dialog</li>
          <li>• <strong>Web Browser:</strong> Falls back to File System Access API or input element</li>
          <li>• <strong>Validation:</strong> Checks for valid directory paths</li>
          <li>• <strong>User Experience:</strong> Type manually or browse with native picker</li>
        </ul>
      </div>
    </div>
  )
}
