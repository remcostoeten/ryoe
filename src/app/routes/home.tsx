import { Header } from '@/components/header'
import GithubStarButton from '@/features/github-star-button'
import { DatabaseHealthIndicator } from '@/components/database-health-indicator'
import { DatabaseQueryTester } from '@/components/database-query-tester'
import { UserCreationForm } from '@/components/user-creation-form'

export function HomePage() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-6">
                    <div className="space-y-3">
                        <Header />
                        <h1 className="text-3xl items-center">
                            Welcome to Tauri Core template!
                        </h1>
                        <p>
                            This template is a starting point for building Tauri
                            apps with Vite, React, and Tailwind CSS.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <DatabaseHealthIndicator />
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>
                            Database health indicator shows real-time SQLite
                            database status
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <DatabaseQueryTester />
                </div>

                <div className="flex justify-center">
                    <GithubStarButton />
                </div>

                <div className="mt-8 p-6 bg-card rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Create User</h2>
                    <UserCreationForm />
                </div>
            </div>
        </div>
    )
}

// Necessary for react router to lazy load.
export const Component = HomePage
