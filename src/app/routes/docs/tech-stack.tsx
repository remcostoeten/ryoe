import { Suspense, useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
    Package,
    Code2,
    Database,
    Monitor,
    Palette,
    Wrench,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react'
import {
    getTechStack,
    readPackageJson,
    type TechStackItem,
    type PackageInfo
} from '@/lib/package-reader'
import { cn } from '@/lib/utils'

const CategoryIcon = ({
    category
}: {
    category: TechStackItem['category']
}) => {
    const iconProps = { className: 'h-4 w-4' }

    switch (category) {
        case 'frontend':
            return <Code2 {...iconProps} />
        case 'backend':
            return <Database {...iconProps} />
        case 'build':
            return <Wrench {...iconProps} />
        case 'dev':
            return <Wrench {...iconProps} />
        case 'ui':
            return <Palette {...iconProps} />
        case 'database':
            return <Database {...iconProps} />
        case 'desktop':
            return <Monitor {...iconProps} />
        default:
            return <Package {...iconProps} />
    }
}

const CategoryBadge = ({
    category,
    isDev
}: {
    category: TechStackItem['category']
    isDev?: boolean
}) => {
    const colors = {
        frontend:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        backend:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        build: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        dev: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        ui: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
        database:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        desktop:
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    }

    return (
        <Badge variant="secondary" className={cn(colors[category], 'text-xs')}>
            <CategoryIcon category={category} />
            <span className="ml-1 capitalize">{category}</span>
            {isDev && <span className="ml-1">(Dev)</span>}
        </Badge>
    )
}

const TechStackCard = ({ item }: { item: TechStackItem }) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(`${item.name}@${item.version}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-mono">
                            {item.name}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                            {item.description}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="ml-2 h-8 w-8 p-0"
                    >
                        {copied ? (
                            <Check className="h-3 w-3 text-green-600" />
                        ) : (
                            <Copy className="h-3 w-3" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CategoryBadge
                            category={item.category}
                            isDev={item.isDev}
                        />
                        <Badge variant="outline" className="font-mono text-xs">
                            {item.version}
                        </Badge>
                    </div>
                    {item.website && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                                href={item.website}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

const PackageJsonViewer = ({ packageInfo }: { packageInfo: PackageInfo }) => {
    const [copied, setCopied] = useState(false)

    const packageJsonString = JSON.stringify(packageInfo, null, 2)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(packageJsonString)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">package.json</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-green-600" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono max-h-96">
                <code>{packageJsonString}</code>
            </pre>
        </div>
    )
}

const TechStackSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)

function TechStackContent() {
    const [techStack, setTechStack] = useState<TechStackItem[]>([])
    const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [stack, pkg] = await Promise.all([
                    getTechStack(),
                    readPackageJson()
                ])
                setTechStack(stack)
                setPackageInfo(pkg)
            } catch (error) {
                console.error('Failed to load tech stack:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const categories = [
        'all',
        'frontend',
        'ui',
        'desktop',
        'database',
        'build',
        'dev'
    ]
    const filteredStack =
        selectedCategory === 'all'
            ? techStack
            : techStack.filter((item) => item.category === selectedCategory)

    const categoryStats = categories.reduce(
        (acc, cat) => {
            if (cat === 'all') {
                acc[cat] = techStack.length
            } else {
                acc[cat] = techStack.filter(
                    (item) => item.category === cat
                ).length
            }
            return acc
        },
        {} as Record<string, number>
    )

    if (loading) {
        return <TechStackSkeleton />
    }

    return (
        <div className="space-y-8">
            {/* Overview */}
            <div className="space-y-4">
                <h2 id="overview" className="text-2xl font-bold">
                    Technology Stack Overview
                </h2>
                <p className="text-muted-foreground">
                    This page showcases all the technologies, frameworks, and
                    tools used in the ryoe Tauri application. The data is
                    dynamically read from our package.json file.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {categoryStats.frontend}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Frontend
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-pink-600">
                                {categoryStats.ui}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                UI Libraries
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {categoryStats.desktop}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Desktop
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {categoryStats.build + categoryStats.dev}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Dev Tools
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filter */}
            <div className="space-y-4">
                <h3 id="dependencies" className="text-xl font-semibold">
                    Dependencies
                </h3>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={
                                selectedCategory === category
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="gap-2"
                        >
                            {category !== 'all' && (
                                <CategoryIcon
                                    category={
                                        category as TechStackItem['category']
                                    }
                                />
                            )}
                            <span className="capitalize">{category}</span>
                            <Badge variant="secondary" className="ml-1">
                                {categoryStats[category]}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStack.map((item, index) => (
                    <TechStackCard key={`${item.name}-${index}`} item={item} />
                ))}
            </div>

            {/* Package.json Viewer */}
            {packageInfo && (
                <div className="space-y-4">
                    <h3 id="package-json" className="text-xl font-semibold">
                        Raw Package Configuration
                    </h3>
                    <PackageJsonViewer packageInfo={packageInfo} />
                </div>
            )}
        </div>
    )
}

export default function TechStackPage() {
    const { toc, isLoading: tocLoading } = useToc()

    return (
        <DocsLayout
            title="Technology Stack"
            previousPage={{
                title: 'Documentation Home',
                path: '/docs'
            }}
            nextPage={{
                title: 'Architecture',
                path: '/docs/architecture'
            }}
            toc={toc}
            isLoading={tocLoading}
        >
            <Suspense fallback={<TechStackSkeleton />}>
                <TechStackContent />
            </Suspense>
        </DocsLayout>
    )
}
