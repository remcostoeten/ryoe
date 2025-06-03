import React, { Suspense } from 'react'
import { DocsLayout } from '@/components/layout/docs-layout'
import { useToc } from '@/hooks/use-toc'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileTree, type FileTreeNode } from '@/components/ui/file-tree'
import {
    CheckCircle,
    Clock,
    Calendar,
    Database,
    FileText,
    Settings,
    Search,
    Palette,
    FolderOpen,
    Terminal,
    Bell,
    Keyboard,
    Archive,
    Monitor
} from 'lucide-react'

interface ServiceInfo {
    name: string
    description: string
    status: 'done' | 'in-progress' | 'planned'
    category: 'core' | 'secondary' | 'enhancement'
    icon: React.ComponentType<{ className?: string }>
    features: string[]
    priority: number
}

const services: ServiceInfo[] = [
    // Core Services (Build First)
    {
        name: 'filesystem-storage',
        description: 'File system operations and local storage management',
        status: 'done',
        category: 'core',
        icon: Database,
        features: [
            'Local file operations',
            'Storage API',
            'Path resolution',
            'Data persistence'
        ],
        priority: 1
    },
    {
        name: 'notes',
        description: 'Note-taking system with rich text support',
        status: 'planned',
        category: 'core',
        icon: FileText,
        features: [
            'Rich text editing',
            'Note organization',
            'Tags and categories',
            'Search within notes'
        ],
        priority: 2
    },
    {
        name: 'tasks',
        description: 'Task management and todo functionality',
        status: 'planned',
        category: 'core',
        icon: CheckCircle,
        features: [
            'Task creation',
            'Due dates',
            'Priority levels',
            'Task categories'
        ],
        priority: 3
    },
    {
        name: 'port-manager',
        description: 'Port monitoring and process management for development',
        status: 'planned',
        category: 'core',
        icon: Terminal,
        features: [
            'Port scanning',
            'Process detection',
            'Kill processes',
            'Dev server management'
        ],
        priority: 4
    },
    {
        name: 'settings',
        description: 'Application preferences and configuration',
        status: 'planned',
        category: 'core',
        icon: Settings,
        features: [
            'User preferences',
            'Theme settings',
            'App configuration',
            'Export/import settings'
        ],
        priority: 5
    },

    // Secondary Services (Build Next)
    {
        name: 'search',
        description: 'Global search across notes, tasks, and content',
        status: 'planned',
        category: 'secondary',
        icon: Search,
        features: [
            'Full-text search',
            'Search indexing',
            'Advanced filters',
            'Search history'
        ],
        priority: 6
    },
    {
        name: 'process-manager',
        description: 'Broader system process management beyond ports',
        status: 'planned',
        category: 'secondary',
        icon: Monitor,
        features: [
            'System monitoring',
            'Process control',
            'Resource usage',
            'Performance metrics'
        ],
        priority: 7
    },
    {
        name: 'project-manager',
        description: 'Track and manage development projects',
        status: 'planned',
        category: 'secondary',
        icon: FolderOpen,
        features: [
            'Project detection',
            'Workspace management',
            'Project templates',
            'Quick switching'
        ],
        priority: 8
    },
    {
        name: 'notifications',
        description: 'System notifications and reminders',
        status: 'planned',
        category: 'secondary',
        icon: Bell,
        features: [
            'Task reminders',
            'System alerts',
            'Custom notifications',
            'Notification history'
        ],
        priority: 9
    },

    // Enhancement Services (Build Later)
    {
        name: 'shortcuts',
        description: 'Global hotkeys and keyboard shortcuts',
        status: 'planned',
        category: 'enhancement',
        icon: Keyboard,
        features: [
            'Global hotkeys',
            'Custom shortcuts',
            'Shortcut conflicts',
            'Quick actions'
        ],
        priority: 10
    },
    {
        name: 'backup',
        description: 'Data backup and restore functionality',
        status: 'planned',
        category: 'enhancement',
        icon: Archive,
        features: [
            'Automatic backups',
            'Manual backups',
            'Restore functionality',
            'Backup validation'
        ],
        priority: 11
    },
    {
        name: 'themes',
        description: 'Theme management and customization',
        status: 'planned',
        category: 'enhancement',
        icon: Palette,
        features: [
            'Theme switching',
            'Custom themes',
            'Color schemes',
            'UI customization'
        ],
        priority: 12
    },
    {
        name: 'file-system',
        description: 'Advanced file operations and management',
        status: 'planned',
        category: 'enhancement',
        icon: FolderOpen,
        features: [
            'File operations',
            'File watching',
            'Recent files',
            'File search'
        ],
        priority: 13
    },
    {
        name: 'window-manager',
        description: 'Window state management and persistence',
        status: 'planned',
        category: 'enhancement',
        icon: Monitor,
        features: [
            'Window positioning',
            'State persistence',
            'Multi-monitor support',
            'Window restoration'
        ],
        priority: 14
    }
]

const getStatusIcon = (status: ServiceInfo['status']) => {
    switch (status) {
        case 'done':
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'in-progress':
            return <Clock className="h-4 w-4 text-yellow-600" />
        case 'planned':
            return <Calendar className="h-4 w-4 text-blue-600" />
    }
}

const getStatusBadge = (status: ServiceInfo['status']) => {
    const colors = {
        done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'in-progress':
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }

    return (
        <Badge className={colors[status]}>
            {getStatusIcon(status)}
            <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
        </Badge>
    )
}

const getCategoryBadge = (category: ServiceInfo['category']) => {
    const colors = {
        core: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        secondary:
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        enhancement:
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }

    return (
        <Badge variant="outline" className={colors[category]}>
            {category}
        </Badge>
    )
}

const ServiceCard = ({ service }: { service: ServiceInfo }) => {
    const IconComponent = service.icon

    return (
        <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-lg font-mono">
                                {service.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                                {service.description}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        {getStatusBadge(service.status)}
                        {getCategoryBadge(service.category)}
                        <Badge variant="secondary">
                            Priority {service.priority}
                        </Badge>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">
                            Key Features:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {service.features.map((feature, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const servicesFileTree: FileTreeNode[] = [
    {
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
            {
                name: 'services',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        name: 'filesystem-storage',
                        type: 'folder',
                        status: 'done',
                        description: '✅ Already implemented',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'types.ts', type: 'file' },
                            { name: 'storage-api.ts', type: 'file' },
                            { name: 'file-operations.ts', type: 'file' }
                        ]
                    },
                    {
                        name: 'notes',
                        type: 'folder',
                        status: 'planned',
                        description: 'Note-taking functionality',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'types.ts', type: 'file' },
                            { name: 'note-repository.ts', type: 'file' },
                            { name: 'note-search.ts', type: 'file' },
                            { name: 'note-export.ts', type: 'file' }
                        ]
                    },
                    {
                        name: 'tasks',
                        type: 'folder',
                        status: 'planned',
                        description: 'Task management',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'types.ts', type: 'file' },
                            { name: 'task-repository.ts', type: 'file' },
                            { name: 'task-scheduler.ts', type: 'file' }
                        ]
                    },
                    {
                        name: 'port-manager',
                        type: 'folder',
                        status: 'planned',
                        description: 'Port monitoring & management',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'types.ts', type: 'file' },
                            { name: 'port-scanner.ts', type: 'file' },
                            { name: 'port-killer.ts', type: 'file' },
                            { name: 'dev-server-detector.ts', type: 'file' }
                        ]
                    },
                    {
                        name: 'search',
                        type: 'folder',
                        status: 'planned',
                        description: 'Global search functionality',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'global-search.ts', type: 'file' },
                            { name: 'search-indexer.ts', type: 'file' }
                        ]
                    },
                    {
                        name: 'settings',
                        type: 'folder',
                        status: 'planned',
                        description: 'App settings/preferences',
                        children: [
                            { name: 'index.ts', type: 'file' },
                            { name: 'settings-manager.ts', type: 'file' },
                            { name: 'theme-settings.ts', type: 'file' }
                        ]
                    }
                ]
            }
        ]
    }
]

const ArchitectureSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)

function ArchitectureContent() {
    const coreServices = services.filter((s) => s.category === 'core')
    const secondaryServices = services.filter((s) => s.category === 'secondary')
    const enhancementServices = services.filter(
        (s) => s.category === 'enhancement'
    )

    return (
        <div className="space-y-8">
            {/* Overview */}
            <div className="space-y-4">
                <h2 id="overview" className="text-2xl font-bold">
                    Architecture Overview
                </h2>
                <p className="text-muted-foreground">
                    This page outlines the planned architecture for the ryoe
                    Tauri application, organized into three main categories of
                    services. Each service is designed to be modular and
                    independent, allowing for incremental development and
                    testing.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl font-bold text-red-600">
                                {coreServices.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Core Services
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Build First
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {secondaryServices.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Secondary Services
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Build Next
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {enhancementServices.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Enhancement Services
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Build Later
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* File Structure */}
            <div className="space-y-4">
                <h3 id="file-structure" className="text-xl font-semibold">
                    Planned File Structure
                </h3>
                <p className="text-muted-foreground">
                    The services will be organized in a modular structure under
                    the <code>src/services/</code> directory.
                </p>
                <FileTree data={servicesFileTree} showStatus={true} />
            </div>

            {/* Core Services */}
            <div className="space-y-4">
                <h3 id="core-services" className="text-xl font-semibold">
                    Core Services (Build First)
                </h3>
                <p className="text-muted-foreground">
                    These are the fundamental services that form the backbone of
                    the application. They should be built first as other
                    services depend on them.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coreServices.map((service, index) => (
                        <ServiceCard key={`core-${index}`} service={service} />
                    ))}
                </div>
            </div>

            {/* Secondary Services */}
            <div className="space-y-4">
                <h3 id="secondary-services" className="text-xl font-semibold">
                    Secondary Services (Build Next)
                </h3>
                <p className="text-muted-foreground">
                    These services extend the core functionality and provide
                    additional features that enhance the user experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secondaryServices.map((service, index) => (
                        <ServiceCard
                            key={`secondary-${index}`}
                            service={service}
                        />
                    ))}
                </div>
            </div>

            {/* Enhancement Services */}
            <div className="space-y-4">
                <h3 id="enhancement-services" className="text-xl font-semibold">
                    Enhancement Services (Build Later)
                </h3>
                <p className="text-muted-foreground">
                    These services provide advanced features and quality-of-life
                    improvements that can be added once the core functionality
                    is stable.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enhancementServices.map((service, index) => (
                        <ServiceCard
                            key={`enhancement-${index}`}
                            service={service}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function ArchitecturePage() {
    const { toc, isLoading: tocLoading } = useToc()

    return (
        <DocsLayout
            title="Architecture"
            previousPage={{
                title: 'Technology Stack',
                path: '/docs/tech-stack'
            }}
            nextPage={{
                title: 'Documentation Home',
                path: '/docs'
            }}
            toc={toc}
            isLoading={tocLoading}
        >
            <Suspense fallback={<ArchitectureSkeleton />}>
                <ArchitectureContent />
            </Suspense>
        </DocsLayout>
    )
}
