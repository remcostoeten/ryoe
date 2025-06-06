'use client'

import { useState, useRef, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy, Check, Download, Play, Terminal } from 'lucide-react'
import { cn } from '@/utilities'

type TProps =  {
    children: string
    language?: string
    filename?: string
    showLineNumbers?: boolean
    highlightLines?: number[]
    maxHeight?: string
    copyable?: boolean
    executable?: boolean
    downloadable?: boolean
    className?: string
}

// Skeleton for code blocks
export const CodeBlockSkeleton = memo(({ lines = 8 }: { lines?: number }) => (
    <div className="relative rounded-lg border bg-muted/50 overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Code content skeleton */}
        <div className="p-4 space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-6 flex-shrink-0" />
                    <Skeleton
                        className="h-4 flex-1"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                </div>
            ))}
        </div>
    </div>
))

CodeBlockSkeleton.displayName = 'CodeBlockSkeleton'

export const CodeBlock = memo(
    ({
        children,
        language = 'text',
        filename,
        showLineNumbers = true,
        highlightLines = [],
        maxHeight = '500px',
        copyable = true,
        executable = false,
        downloadable = false,
        className
    }: TProps) => {
        const [copied, setCopied] = useState(false)
        const [isExecuting, setIsExecuting] = useState(false)
        const codeRef = useRef<HTMLElement>(null)

        const lines = children.trim().split('\n')

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(children)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy code:', err)
            }
        }

        const executeCode = async () => {
            setIsExecuting(true)
            // Simulate code execution
            setTimeout(() => setIsExecuting(false), 1500)
        }

        const downloadCode = () => {
            const blob = new Blob([children], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename || `code.${language}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }

        const getLanguageIcon = (lang: string) => {
            switch (lang.toLowerCase()) {
                case 'javascript':
                case 'js':
                    return '🟨'
                case 'typescript':
                case 'ts':
                    return '🔷'
                case 'python':
                case 'py':
                    return '🐍'
                case 'bash':
                case 'shell':
                    return '💻'
                case 'json':
                    return '📄'
                case 'css':
                    return '🎨'
                case 'html':
                    return '🌐'
                default:
                    return '📝'
            }
        }

        return (
            <div
                className={cn(
                    'relative group rounded-lg border bg-card overflow-hidden shadow-sm',
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-sm" aria-hidden="true">
                            {getLanguageIcon(language)}
                        </span>
                        <Badge
                            variant="secondary"
                            className="text-xs font-mono"
                        >
                            {language}
                        </Badge>
                        {filename && (
                            <span className="text-sm text-muted-foreground font-mono">
                                {filename}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {executable && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={executeCode}
                                disabled={isExecuting}
                                className="h-8 w-8 p-0"
                                aria-label="Execute code"
                            >
                                {isExecuting ? (
                                    <Terminal className="h-3 w-3 animate-pulse" />
                                ) : (
                                    <Play className="h-3 w-3" />
                                )}
                            </Button>
                        )}

                        {downloadable && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={downloadCode}
                                className="h-8 w-8 p-0"
                                aria-label="Download code"
                            >
                                <Download className="h-3 w-3" />
                            </Button>
                        )}

                        {copyable && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={copyToClipboard}
                                className="h-8 w-8 p-0"
                                aria-label={copied ? 'Copied!' : 'Copy code'}
                            >
                                {copied ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Code content */}
                <div className="relative overflow-auto" style={{ maxHeight }}>
                    <pre className="p-4 text-sm leading-relaxed">
                        <code
                            ref={codeRef}
                            className={cn(
                                'block font-mono',
                                `language-${language}`
                            )}
                        >
                            {showLineNumbers ? (
                                <div className="table w-full">
                                    {lines.map((line, index) => {
                                        const lineNumber = index + 1
                                        const isHighlighted =
                                            highlightLines.includes(lineNumber)

                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    'table-row',
                                                    isHighlighted &&
                                                        'bg-yellow-100/10 dark:bg-yellow-900/10'
                                                )}
                                            >
                                                <span className="table-cell pr-4 text-right text-muted-foreground select-none w-12 border-r border-border/50">
                                                    {lineNumber}
                                                </span>
                                                <span className="table-cell pl-4 whitespace-pre-wrap break-all">
                                                    {line || '\n'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <span className="whitespace-pre-wrap break-all">
                                    {children}
                                </span>
                            )}
                        </code>
                    </pre>

                    {/* Execution indicator */}
                    {isExecuting && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex items-center gap-2 text-sm">
                                <Terminal className="h-4 w-4 animate-pulse" />
                                Executing...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

CodeBlock.displayName = 'CodeBlock'
