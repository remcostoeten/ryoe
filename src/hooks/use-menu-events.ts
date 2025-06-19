import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { useNavigate } from 'react-router'
import { useSidebar } from '@/presentation/components/ui/components/ui/sidebar'
import { isTauriEnvironment } from '@/shared/utils'

type MenuAction = 
  | 'new_file'
  | 'open_file' 
  | 'save_file'
  | 'toggle_sidebar'
  | 'toggle_right_sidebar'
  | 'about'

// interface MenuEventPayload {
//   action: MenuAction
// }

// interface NavigateEventPayload {
//   path: string
// }

export function useMenuEvents() {
  const navigate = useNavigate()
  const { toggleSidebar } = useSidebar()

  useEffect(() => {
    if (!isTauriEnvironment()) return

    let unlistenMenuAction: (() => void) | undefined
    let unlistenNavigate: (() => void) | undefined

    // Listen for menu actions
    const setupMenuListener = async () => {
      unlistenMenuAction = await listen<MenuAction>('menu-action', (event) => {
        const action = event.payload
        
        switch (action) {
          case 'new_file':
            // Navigate to notes page and trigger new file creation
            navigate('/notes')
            // You can emit a custom event here to trigger new file creation
            window.dispatchEvent(new CustomEvent('create-new-file'))
            break
            
          case 'open_file':
            // Trigger file picker
            window.dispatchEvent(new CustomEvent('open-file-dialog'))
            break
            
          case 'save_file':
            // Trigger save current file
            window.dispatchEvent(new CustomEvent('save-current-file'))
            break
            
          case 'toggle_sidebar':
            toggleSidebar()
            break
            
          case 'toggle_right_sidebar':
            // Trigger right sidebar toggle
            window.dispatchEvent(new CustomEvent('toggle-right-sidebar'))
            break
            
          case 'about':
            // Show about dialog
            window.dispatchEvent(new CustomEvent('show-about-dialog'))
            break
            
          default:
            console.log('Unknown menu action:', action)
        }
      })
    }

    // Listen for navigation events
    const setupNavigateListener = async () => {
      unlistenNavigate = await listen<string>('navigate', (event) => {
        const path = event.payload
        navigate(path)
      })
    }

    setupMenuListener()
    setupNavigateListener()

    return () => {
      unlistenMenuAction?.()
      unlistenNavigate?.()
    }
  }, [navigate, toggleSidebar])
}
