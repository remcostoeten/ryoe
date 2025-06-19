/**
 * Export service - functions for exporting notes and folders
 * Pure functions only, no classes
 */

import type { TNote } from '@/types/notes'
import type { TServiceResult } from './types'

// Convert note content to different formats
function convertToMarkdown(note: TNote): string {
  return `# ${note.title}\n\n${note.content}`
}

function convertToHTML(note: TNote): string {
  const markdown = convertToMarkdown(note)
  // Basic markdown to HTML conversion (in a real app, use a proper markdown parser)
  const html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${note.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`
}

function convertToJSON(note: TNote): string {
  return JSON.stringify({
    id: note.id,
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    position: note.position,
    isPublic: note.isPublic,
    isFavorite: note.isFavorite,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    exportedAt: new Date().toISOString()
  }, null, 2)
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export single note
export async function exportNote(
  note: TNote,
  format: 'markdown' | 'html' | 'json' = 'markdown'
): Promise<TServiceResult<string>> {
  try {
    let content: string
    let filename: string
    let mimeType: string

    const safeTitle = note.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')

    switch (format) {
      case 'markdown':
        content = convertToMarkdown(note)
        filename = `${safeTitle}.md`
        mimeType = 'text/markdown'
        break
      case 'html':
        content = convertToHTML(note)
        filename = `${safeTitle}.html`
        mimeType = 'text/html'
        break
      case 'json':
        content = convertToJSON(note)
        filename = `${safeTitle}.json`
        mimeType = 'application/json'
        break
      default:
        return {
          success: false,
          error: 'Unsupported export format',
          code: 'INVALID_FORMAT'
        }
    }

    downloadFile(content, filename, mimeType)

    return {
      success: true,
      data: `Note exported as ${filename}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      code: 'EXPORT_ERROR'
    }
  }
}

// Export multiple notes
export async function exportNotes(
  notes: TNote[],
  format: 'markdown' | 'html' | 'json' = 'markdown'
): Promise<TServiceResult<string>> {
  try {
    if (notes.length === 0) {
      return {
        success: false,
        error: 'No notes to export',
        code: 'NO_NOTES'
      }
    }

    if (notes.length === 1) {
      return exportNote(notes[0], format)
    }

    let content: string
    let filename: string
    let mimeType: string

    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'markdown':
        content = notes.map(note => convertToMarkdown(note)).join('\n\n---\n\n')
        filename = `notes-export-${timestamp}.md`
        mimeType = 'text/markdown'
        break
      case 'html':
        const htmlNotes = notes.map(note => convertToHTML(note).replace(/<!DOCTYPE.*?<body>/s, '').replace(/<\/body>.*?<\/html>/s, ''))
        content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Notes Export - ${timestamp}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .note-separator { border-top: 1px solid #ddd; margin: 3rem 0; padding-top: 2rem; }
  </style>
</head>
<body>
  ${htmlNotes.map((html, index) => index === 0 ? html : `<div class="note-separator">${html}</div>`).join('')}
</body>
</html>`
        filename = `notes-export-${timestamp}.html`
        mimeType = 'text/html'
        break
      case 'json':
        content = JSON.stringify({
          exportedAt: new Date().toISOString(),
          totalNotes: notes.length,
          notes: notes.map(note => JSON.parse(convertToJSON(note)))
        }, null, 2)
        filename = `notes-export-${timestamp}.json`
        mimeType = 'application/json'
        break
      default:
        return {
          success: false,
          error: 'Unsupported export format',
          code: 'INVALID_FORMAT'
        }
    }

    downloadFile(content, filename, mimeType)

    return {
      success: true,
      data: `${notes.length} notes exported as ${filename}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      code: 'EXPORT_ERROR'
    }
  }
}

// Print note (opens print dialog)
export async function printNote(note: TNote): Promise<TServiceResult<string>> {
  try {
    const htmlContent = convertToHTML(note)
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      return {
        success: false,
        error: 'Failed to open print window. Please check popup blocker settings.',
        code: 'PRINT_BLOCKED'
      }
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()

    return {
      success: true,
      data: 'Note sent to printer'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Print failed',
      code: 'PRINT_ERROR'
    }
  }
}

// Share note (copy to clipboard)
export async function shareNote(note: TNote): Promise<TServiceResult<string>> {
  try {
    const shareText = `${note.title}\n\n${note.content}`

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareText)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    return {
      success: true,
      data: 'Note content copied to clipboard'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Share failed',
      code: 'SHARE_ERROR'
    }
  }
}
