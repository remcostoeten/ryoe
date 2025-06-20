import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CodeBlock } from '@/components/ui/code-block'
import {
    Search,
    Play,
    Code2,
    Settings,
    Eye,
    BookOpen,
    Sparkles
} from 'lucide-react'
import { cn } from '@/shared/utils'
import type { DemoShowcaseProps, ComponentDemo, DemoState, DemoAction } from '../types'
import { getAllDemos, getDemoCategories, searchDemos } from '../registry'

// Initialize demos
import '../demos/init'

export function DemoShowcase({
    demos: propDemos,
    selectedDemo: propSelectedDemo,
    onDemoChange,
    className
}: DemoShowcaseProps) {
    const [selectedDemo, setSelectedDemo] = useState(propSelectedDemo || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedState, setSelectedState] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<string>('All')

    // Use provided demos or registry demos
    const allDemos = propDemos || getAllDemos()
    const categories = getDemoCategories()

    // Filter demos based on search and category
    const filteredDemos = useMemo(() => {
        let demos = allDemos

        // Apply search filter
        if (searchQuery.trim()) {
            demos = searchDemos(searchQuery)
        }

        // Apply category filter
        if (selectedCategory !== 'All') {
            demos = demos.filter(demo => demo.category === selectedCategory)
        }

        return demos
    }, [allDemos, searchQuery, selectedCategory])

    // Get current demo
    const currentDemo = allDemos.find(demo => demo.id === selectedDemo)

    // Handle demo selection
    const handleDemoSelect = (demoId: string) => {
        setSelectedDemo(demoId)
        setSelectedState('') // Reset state selection
        onDemoChange?.(demoId)
    }

    // Get current props (either from selected state or default props)
    const getCurrentProps = () => {
        if (!currentDemo) return {}

        if (selectedState && currentDemo.states) {
            const state = currentDemo.states.find(s => s.id === selectedState)
            return state?.props || currentDemo.defaultProps || {}
        }

        return currentDemo.defaultProps || {}
    }

    // Render the component with current props
    const renderComponent = () => {
        if (!currentDemo) return null

        const Component = currentDemo.component
        const props = getCurrentProps()

        const element = <Component {...props} />

        return currentDemo.renderWrapper ? currentDemo.renderWrapper(element) : element
    }

    return (
        <div className={cn('h-full flex flex-col space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30">
                        <BookOpen className="w-5 h-5 text-foreground/80" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Component Showcase</h1>
                        <p className="text-muted-foreground">Interactive component demonstrations</p>
                    </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {allDemos.length} Components
                </Badge>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Demo List */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-card/50 border-border/40"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === 'All' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory('All')}
                        >
                            All
                        </Button>
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>

                    <Separator />

                    {/* Demo List */}
                    <div className="space-y-2">
                        {filteredDemos.map(demo => (
                            <Card
                                key={demo.id}
                                className={cn(
                                    'cursor-pointer transition-all duration-200 hover:border-border/60',
                                    selectedDemo === demo.id
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'border-border/30 hover:bg-card/80'
                                )}
                                onClick={() => handleDemoSelect(demo.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-sm">{demo.title}</h3>
                                            {demo.category && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {demo.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {demo.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {currentDemo ? (
                        <>
                            {/* Demo Header */}
                            <Card className="bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {currentDemo.title}
                                                {currentDemo.category && (
                                                    <Badge variant="outline">{currentDemo.category}</Badge>
                                                )}
                                            </CardTitle>
                                            <p className="text-muted-foreground mt-1">{currentDemo.description}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            <Tabs defaultValue="preview" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="preview" className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="flex items-center gap-2">
                                        <Code2 className="w-4 h-4" />
                                        Code
                                    </TabsTrigger>
                                    <TabsTrigger value="actions" className="flex items-center gap-2">
                                        <Play className="w-4 h-4" />
                                        Actions
                                    </TabsTrigger>
                                </TabsList>

                                {/* Preview Tab */}
                                <TabsContent value="preview" className="space-y-4">
                                    {/* States Selector */}
                                    {currentDemo.states && currentDemo.states.length > 0 && (
                                        <Card className="border-border/30">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <Settings className="w-4 h-4" />
                                                    Component States
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant={!selectedState ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setSelectedState('')}
                                                    >
                                                        Default
                                                    </Button>
                                                    {currentDemo.states.map(state => (
                                                        <Button
                                                            key={state.id}
                                                            variant={selectedState === state.id ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setSelectedState(state.id)}
                                                        >
                                                            {state.label}
                                                        </Button>
                                                    ))}
                                                </div>

                                                {/* State Description */}
                                                {selectedState && (
                                                    <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/20">
                                                        <p className="text-sm text-muted-foreground">
                                                            {currentDemo.states?.find(s => s.id === selectedState)?.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Component Preview */}
                                    <Card className="border-border/30">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Component Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="min-h-32 flex items-center justify-center p-8 rounded-lg bg-gradient-to-br from-background/50 to-muted/10 border border-border/20">
                                                {renderComponent()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Code Tab */}
                                <TabsContent value="code">
                                    <Card className="border-border/30">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Usage Code</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CodeBlock
                                                language="tsx"
                                                copyable={true}
                                                showLineNumbers={true}
                                            >
                                                {currentDemo.code}
                                            </CodeBlock>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Actions Tab */}
                                <TabsContent value="actions">
                                    <Card className="border-border/30">
                                        <CardHeader>
                                            <CardTitle className="text-sm">Available Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {currentDemo.actions && currentDemo.actions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {currentDemo.actions.map(action => {
                                                        const Icon = action.icon

                                                        return (
                                                            <div key={action.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                                                                <div className="flex items-center gap-3">
                                                                    {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                                                                    <div>
                                                                        <h4 className="font-medium text-sm">{action.label}</h4>
                                                                        {action.description && (
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {action.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    variant={action.variant || 'default'}
                                                                    size="sm"
                                                                    onClick={() => action.action()}
                                                                    disabled={action.disabled}
                                                                >
                                                                    <Play className="w-3 h-3 mr-2" />
                                                                    {action.label}
                                                                </Button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>No actions available for this component</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        /* No Demo Selected */
                        <Card className="border-border/30">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">Select a Component</h3>
                                <p className="text-muted-foreground text-center">
                                    Choose a component from the sidebar to view its demonstration
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 