import { useState } from 'react'
import { executeQuery } from '@/api/db'
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

type TQueryResults = {
    status: string
    message: string
    result?: string | null
    responseTime: number
    lastExecuted: string
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
    const [lastResult, setLastResult] = useState<TQueryResults | null>(null)

    async function executeQueryHandler(query: string) {
        setIsExecuting(true)
        try {
            const result = await executeQuery(query)
            setLastResult({
                status: result.status,
                message: result.message,
                result: result.result,
                responseTime: result.responseTime,
                lastExecuted: result.lastExecuted
            })
        } catch (error) {
            setLastResult({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                responseTime: 0,
                lastExecuted: new Date().toISOString()
            })
        } finally {
            setIsExecuting(false)
        }
    }

    function executeCurrentTestQuery() {
        const query = TEST_QUERIES[currentQueryIndex]
        executeQueryHandler(query.query)
    }

    function cycleToNextQuery() {
        setCurrentQueryIndex((prev) => (prev + 1) % TEST_QUERIES.length)
    }

    function executeCustomQuery() {
        if (customQuery.trim()) {
            executeQueryHandler(customQuery.trim())
        }
    }

    const currentQuery = TEST_QUERIES[currentQueryIndex]

    function getStatusIcon(status: string) {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-emerald-400" />
            case 'error':
                return <XCircle className="h-4 w-4 text-rose-400" />
            default:
                return <Database className="h-4 w-4 text-gray-400" />
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'success':
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Success</Badge>
            case 'error':
                return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">Error</Badge>
            default:
                return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
        }
    }

    return (
        <Card className="w-full max-w-4xl bg-gray-900/50 border-gray-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-200">
                    <Database className="h-5 w-5" />
                    Database Query Tester
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Test database queries and view results. Cycle through
                    predefined queries or run custom ones.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-200">Test Queries</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                                {currentQueryIndex + 1} of {TEST_QUERIES.length}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={cycleToNextQuery}
                                disabled={isExecuting}
                                className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-200"
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-200">{currentQuery.name}</h4>
                            <Button
                                onClick={executeCurrentTestQuery}
                                disabled={isExecuting}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isExecuting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                Execute
                            </Button>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                            {currentQuery.description}
                        </p>
                        <pre className="text-sm bg-gray-900/50 border border-gray-600 p-2 rounded font-mono text-gray-300">
                            {currentQuery.query}
                        </pre>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Custom Query</h3>
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
                            className="font-mono bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
                        />
                        <Button
                            onClick={executeCustomQuery}
                            disabled={isExecuting || !customQuery.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

                {lastResult && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-200">
                                Query Result
                            </h3>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(lastResult.status)}
                                {getStatusBadge(lastResult.status)}
                                <span className="text-sm text-gray-400">
                                    {lastResult.responseTime}ms
                                </span>
                            </div>
                        </div>

                        <div className={`p-3 rounded-lg border ${
                            lastResult.status === 'success'
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : lastResult.status === 'error'
                                ? "bg-rose-500/10 border-rose-500/30"
                                : "bg-gray-800/50 border-gray-600"
                        }`}>
                            <div className={`text-sm font-medium mb-1 ${
                                lastResult.status === 'success'
                                    ? "text-emerald-400"
                                    : lastResult.status === 'error'
                                    ? "text-rose-400"
                                    : "text-gray-300"
                            }`}>
                                {lastResult.status === 'success' ? 'Success!' : lastResult.status === 'error' ? 'Error' : 'Result'}
                            </div>
                            <div className={`text-xs opacity-90 ${
                                lastResult.status === 'success'
                                    ? "text-emerald-400"
                                    : lastResult.status === 'error'
                                    ? "text-rose-400"
                                    : "text-gray-300"
                            }`}>
                                {lastResult.message}
                            </div>
                        </div>

                        {lastResult.result && (
                            <div className="p-3 border border-gray-600 rounded-lg bg-gray-800/50 mt-4">
                                <div className="text-sm font-medium text-gray-300 mb-2">
                                    Query Data
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        {lastResult.result.includes(
                                            '|'
                                        ) && (
                                            <>
                                                <thead>
                                                    <tr className="bg-gray-900/50">
                                                        {lastResult.result
                                                            .split('\n')[0]
                                                            .split(' | ')
                                                            .map(
                                                                (
                                                                    header,
                                                                    i
                                                                ) => (
                                                                    <th
                                                                        key={
                                                                            i
                                                                        }
                                                                        className="px-3 py-2 text-left font-medium text-gray-400 border-b border-gray-600"
                                                                    >
                                                                        {
                                                                            header
                                                                        }
                                                                    </th>
                                                                )
                                                            )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lastResult.result
                                                        .split('\n')
                                                        .slice(2) // Skip header and separator line
                                                        .filter(
                                                            (line) =>
                                                                line.trim() !==
                                                                ''
                                                        )
                                                        .map(
                                                            (
                                                                row,
                                                                rowIndex
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        rowIndex
                                                                    }
                                                                    className={
                                                                        rowIndex %
                                                                            2 ===
                                                                        0
                                                                            ? 'bg-gray-800/30'
                                                                            : 'bg-gray-900/30'
                                                                    }
                                                                >
                                                                    {row
                                                                        .split(
                                                                            ' | '
                                                                        )
                                                                        .map(
                                                                            (
                                                                                cell,
                                                                                cellIndex
                                                                            ) => (
                                                                                <td
                                                                                    key={
                                                                                        cellIndex
                                                                                    }
                                                                                    className="px-3 py-2 border-t border-gray-600/40 text-gray-300"
                                                                                >
                                                                                    {
                                                                                        cell
                                                                                    }
                                                                                </td>
                                                                            )
                                                                        )}
                                                                </tr>
                                                            )
                                                        )}
                                                </tbody>
                                            </>
                                        )}
                                        {!lastResult.result.includes(
                                            '|'
                                        ) && (
                                            <tbody>
                                                <tr>
                                                    <td className="px-3 py-2">
                                                        <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs">
                                                            {
                                                                lastResult.result
                                                            }
                                                        </pre>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        )}
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 mt-4">
                            Executed at:{' '}
                            {new Date(
                                lastResult.lastExecuted
                            ).toLocaleString()}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
