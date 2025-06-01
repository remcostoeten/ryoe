import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Play,
    SkipForward,
    Loader2,
    CheckCircle,
    XCircle,
    Database,
    Code
} from 'lucide-react'

interface QueryResult {
    status: string
    message: string
    result?: string
    response_time: number
    last_executed: string
}

const TEST_QUERIES = [
    {
        name: 'Create Test Table',
        query: 'CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)',
        description: 'Create a test table to verify database write operations'
    },
    {
        name: 'Insert Test Data',
        query: "INSERT INTO test_table (name) VALUES ('test_entry')",
        description: 'Insert a test record into the test table'
    },
    {
        name: 'Update Test Data',
        query: "UPDATE test_table SET name = 'updated_entry' WHERE name = 'test_entry'",
        description: 'Update test records in the test table'
    },
    {
        name: 'Invalid Table Query',
        query: "INSERT INTO nonexistent_table (name) VALUES ('test')",
        description: 'Test error handling with invalid table'
    },
    {
        name: 'Syntax Error',
        query: "INSRT INTO test_table (name) VALUES ('test')",
        description: 'Test error handling with syntax error'
    }
]

export function DatabaseQueryTester() {
    const [currentQueryIndex, setCurrentQueryIndex] = useState(0)
    const [customQuery, setCustomQuery] = useState('')
    const [isExecuting, setIsExecuting] = useState(false)
    const [lastResult, setLastResult] = useState<QueryResult | null>(null)

    const executeQuery = async (query: string) => {
        setIsExecuting(true)
        try {
            const result = await invoke<QueryResult>('execute_database_query', {
                query
            })
            setLastResult(result)
        } catch (error) {
            setLastResult({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                response_time: 0,
                last_executed: new Date().toISOString()
            })
        } finally {
            setIsExecuting(false)
        }
    }

    const executeCurrentTestQuery = () => {
        const query = TEST_QUERIES[currentQueryIndex]
        executeQuery(query.query)
    }

    const cycleToNextQuery = () => {
        setCurrentQueryIndex((prev) => (prev + 1) % TEST_QUERIES.length)
    }

    const executeCustomQuery = () => {
        if (customQuery.trim()) {
            executeQuery(customQuery.trim())
        }
    }

    const currentQuery = TEST_QUERIES[currentQueryIndex]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <Database className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="success">Success</Badge>
            case 'error':
                return <Badge variant="error">Error</Badge>
            default:
                return <Badge variant="secondary">Unknown</Badge>
        }
    }

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Query Tester
                </CardTitle>
                <CardDescription>
                    Test database queries and view results. Cycle through
                    predefined queries or run custom ones.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Test Query Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Test Queries</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {currentQueryIndex + 1} of {TEST_QUERIES.length}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cycleToNextQuery}
                                disabled={isExecuting}
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{currentQuery.name}</h4>
                            <Button
                                onClick={executeCurrentTestQuery}
                                disabled={isExecuting}
                                size="sm"
                            >
                                {isExecuting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                Execute
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {currentQuery.description}
                        </p>
                        <pre className="text-sm bg-background p-2 rounded border font-mono">
                            {currentQuery.query}
                        </pre>
                    </div>
                </div>

                {/* Custom Query Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Custom Query</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your SQL query here..."
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    executeCustomQuery()
                                }
                            }}
                            disabled={isExecuting}
                            className="font-mono"
                        />
                        <Button
                            onClick={executeCustomQuery}
                            disabled={isExecuting || !customQuery.trim()}
                        >
                            {isExecuting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Code className="h-4 w-4" />
                            )}
                            Run
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                {lastResult && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Query Result
                            </h3>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(lastResult.status)}
                                {getStatusBadge(lastResult.status)}
                                <span className="text-sm text-muted-foreground">
                                    {lastResult.response_time}ms
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    Message
                                </div>
                                <div className="text-sm">
                                    {lastResult.message}
                                </div>
                            </div>

                            {lastResult.result && (
                                <div className="p-3 border rounded-lg">
                                    <div className="text-sm font-medium text-muted-foreground mb-2">
                                        Result
                                    </div>
                                    <pre className="text-sm bg-muted p-3 rounded border font-mono whitespace-pre-wrap overflow-x-auto">
                                        {lastResult.result}
                                    </pre>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                                Executed at:{' '}
                                {new Date(
                                    lastResult.last_executed
                                ).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
