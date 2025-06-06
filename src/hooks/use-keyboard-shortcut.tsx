"use client"

import { useEffect, useState, useCallback, useRef } from "react"

type KeyCombo = {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

type KeyboardShortcutOptions = {
  preventDefault?: boolean
  stopPropagation?: boolean
  debug?: boolean
  enabled?: boolean
}

type KeyboardShortcutHandler = (e: KeyboardEvent) => void

export function useKeyboardShortcut(
  keyCombo: KeyCombo | KeyCombo[],
  callback: KeyboardShortcutHandler,
  options: KeyboardShortcutOptions = {},
) {
  const { preventDefault = true, stopPropagation = true, debug = false, enabled = true } = options
  const [lastPressed, setLastPressed] = useState<string | null>(null)
  const [isDebugVisible, setIsDebugVisible] = useState(debug)
  const [pressedKeys, setPressedKeys] = useState<string[]>([])
  const callbackRef = useRef(callback)
  const combos = Array.isArray(keyCombo) ? keyCombo : [keyCombo]

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Toggle debug visibility
  useEffect(() => {
    setIsDebugVisible(debug)
  }, [debug])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Update pressed keys for debug display
      const keyDisplay = getKeyDisplay(e)
      setPressedKeys((prev) => {
        if (!prev.includes(keyDisplay)) {
          return [...prev, keyDisplay]
        }
        return prev
      })

      // Check if the key combo matches
      const matchedCombo = combos.some((combo) => {
        const keyMatches = e.key.toLowerCase() === combo.key.toLowerCase()
        const ctrlMatches = combo.ctrlKey === undefined || combo.ctrlKey === e.ctrlKey
        const metaMatches = combo.metaKey === undefined || combo.metaKey === e.metaKey
        const shiftMatches = combo.shiftKey === undefined || combo.shiftKey === e.shiftKey
        const altMatches = combo.altKey === undefined || combo.altKey === e.altKey

        return keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches
      })

      if (matchedCombo) {
        setLastPressed(e.key)

        if (preventDefault) {
          e.preventDefault()
        }

        if (stopPropagation) {
          e.stopPropagation()
        }

        callbackRef.current(e)
      }
    },
    [combos, enabled, preventDefault, stopPropagation],
  )

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const keyDisplay = getKeyDisplay(e)
    setPressedKeys((prev) => prev.filter((key) => key !== keyDisplay))
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return {
    lastPressed,
    isDebugVisible,
    pressedKeys,
    setIsDebugVisible,
  }
}

// Helper to get a display-friendly key name
function getKeyDisplay(e: KeyboardEvent): string {
  let display = ""

  if (e.metaKey) display += "⌘+"
  if (e.ctrlKey) display += "Ctrl+"
  if (e.altKey) display += "Alt+"
  if (e.shiftKey) display += "Shift+"

  // Handle special keys
  switch (e.key) {
    case " ":
      display += "Space"
      break
    case "ArrowUp":
      display += "↑"
      break
    case "ArrowDown":
      display += "↓"
      break
    case "ArrowLeft":
      display += "←"
      break
    case "ArrowRight":
      display += "→"
      break
    case "Enter":
      display += "⏎"
      break
    case "Escape":
      display += "Esc"
      break
    case "Tab":
      display += "⇥"
      break
    case "Backspace":
      display += "⌫"
      break
    case "Delete":
      display += "⌦"
      break
    default:
      // Capitalize single letters for better visibility
      display += e.key.length === 1 ? e.key.toUpperCase() : e.key
  }

  return display
}

export function KeyboardDebugger({ visible = true }: { visible?: boolean }) {
  const [keys, setKeys] = useState<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyDisplay = getKeyDisplay(e)
      setKeys((prev) => {
        if (!prev.includes(keyDisplay)) {
          return [...prev, keyDisplay]
        }
        return prev
      })
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyDisplay = getKeyDisplay(e)
      setKeys((prev) => prev.filter((key) => key !== keyDisplay))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  if (!visible || keys.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-wrap gap-2 rounded-lg bg-background AAA-primary p-3 shadow-lg border border-sidebar-border">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex min-w-8 items-center justify-center rounded-md border border-sidebar-border bg-background AAA-accent px-2 py-1 text-sm font-medium text-sidebar-foreground shadow"
        >
          {key}
        </kbd>
      ))}
    </div>
  )
}
