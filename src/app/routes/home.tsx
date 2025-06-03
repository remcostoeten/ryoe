import { Header } from '@/components/header'
import { DatabaseHealthIndicator } from '@/modules/database-actions/ui/database-health-indicator'
import { UserCreationForm } from '@/modules/database-actions/ui/user-creation-form'
import { DatabaseQueryTester } from '@/modules/database-actions/ui/database-query-tester'
import { VersionTest } from '@/components/version-test'

export function HomePage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-6">
                    <div className="space-y-3">
                        <Header />
                    </div>
                    <main className="pt-20 space-y-4">
                        <div className="flex justify-center">
                            <DatabaseHealthIndicator />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>
                                Database health indicator shows real-time SQLite
                                database status
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <VersionTest />
                        </div>

                        <div className="flex justify-center">
                            <DatabaseQueryTester />
                        </div>

                        <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">
                                Create User
                            </h2>
                            <UserCreationForm />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export const Component = HomePage
