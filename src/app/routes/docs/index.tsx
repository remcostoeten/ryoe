import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Database,
    HardDrive,
    FileText,
    ArrowRight,
    BookOpen,
    Code2,
    Search,
    Monitor
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router'

function DocsPage() {
    const docSections = [
        {
            title: 'Storage & File System',
            description:
                'Learn how local storage and file system operations work in our Tauri application',
            icon: HardDrive,
            path: '/docs/storage',
            topics: [
                'Local Storage',
                'File System API',
                'Path Resolution',
                'Data Persistence'
            ]
        },
        {
            title: 'Database Operations',
            description:
                'Complete guide to querying and mutating data with SQLite and Drizzle ORM',
            icon: Database,
            path: '/docs/db-operations',
            topics: [
                'Query Patterns',
                'Mutations',
                'Transactions',
                'Error Handling'
            ]
        },
        {
            title: 'Storage API Reference',
            description:
                'Comprehensive API documentation for all storage-related functions and types',
            icon: Code2,
            path: '/docs/storage-api',
            topics: [
                'API Reference',
                'Type Definitions',
                'Examples',
                'Best Practices'
            ]
        },
        {
            title: 'Window Management',
            description:
                'Screen position persistence and window state management for desktop applications',
            icon: Monitor,
            path: '/docs/window-management',
            topics: [
                'Position Persistence',
                'Multi-Monitor Support',
                'Window State Saving',
                'Automatic Restoration'
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 py-10">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold">Documentation</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Complete guide to storage, database operations, window
                        management, and file system management in our Tauri
                        application
                    </p>
                    <div className="max-w-md mx-auto mt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documentation..."
                                className="pl-10 pr-4 py-6 h-12 rounded-full border-muted-foreground/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docSections.map((section) => {
                        const Icon = section.icon
                        return (
                            <Card
                                key={section.path}
                                className="group hover:shadow-lg transition-all duration-200 border-muted-foreground/20"
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">
                                            {section.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-base">
                                        {section.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                                            Topics Covered:
                                        </h4>
                                        <ul className="space-y-1">
                                            {section.topics.map((topic) => (
                                                <li
                                                    key={topic}
                                                    className="text-sm flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                    {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link to={section.path}>
                                        <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                            Read Documentation
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Quick Start */}
                <Card className="bg-muted/50 border-muted-foreground/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Quick Start Guide
                        </CardTitle>
                        <CardDescription>
                            New to our storage system? Start here for a quick
                            overview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium">
                                    1. Storage Setup
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Initialize local storage and configure file
                                    system paths
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">
                                    2. Database Connection
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Connect to SQLite database and run your
                                    first queries
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">
                                    3. API Integration
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Use our storage APIs in your components and
                                    services
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/docs/storage">
                                <Button variant="outline">
                                    Start with Storage
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/docs/db-operations">
                                <Button variant="outline">
                                    Database Guide
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/docs/window-management">
                                <Button variant="outline">
                                    Window Management
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DocsPage
