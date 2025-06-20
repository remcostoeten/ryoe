import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Database,
    BookOpen,
    Wrench,
    Sparkles
} from 'lucide-react'
import { DatabaseManagement } from '@/modules/development/database'
import { DemoShowcase } from '@/modules/development/demo-showcase'

export function DevelopmentPage() {
    const [activeTab, setActiveTab] = useState('showcase')

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30 shadow-lg">
                            <Wrench className="w-6 h-6 text-foreground/80" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                Development Tools
                            </h1>
                            <p className="text-muted-foreground/80 text-lg">
                                Component showcase and database management utilities
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Development Mode
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="showcase" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <BookOpen className="w-4 h-4" />
                        Component Showcase
                    </TabsTrigger>
                    <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Database className="w-4 h-4" />
                        Database Management
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="showcase" className="space-y-6">
                    <Card className="bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Component Showcase
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Interactive demonstrations of UI components with different states and actions.
                                Similar to Storybook but custom-built for this application.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <DemoShowcase />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database" className="space-y-6">
                    <Card className="bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Database Management
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Development tools for managing database state, health monitoring, and data operations.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <DatabaseManagement
                                onActionComplete={(actionId, success) => {
                                    console.log(`Database action ${actionId} ${success ? 'completed' : 'failed'}`)
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export const Component = DevelopmentPage 