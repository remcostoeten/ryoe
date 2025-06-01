import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import StorageApiMDX from '@/docs/storage-api.mdx'

export function StorageApiPage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/docs">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Docs
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-border" />
                            <h1 className="text-xl font-semibold">
                                Storage API Reference
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/docs/storage">
                                <Button variant="outline" size="sm">
                                    Storage Guide
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/docs/db-operations">
                                <Button variant="outline" size="sm">
                                    Database Operations
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <StorageApiMDX />
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t bg-muted/50">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <Link to="/docs/db-operations">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Previous: Database Operations
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link to="/docs">
                                <Button>
                                    Back to Documentation Home
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Component = StorageApiPage
