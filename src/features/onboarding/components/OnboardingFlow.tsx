export function OnboardingFlow() {
    return (
        <div className="container mx-auto p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to Ryoe</h1>
                <p className="text-muted-foreground mb-8">
                    Let's get you set up with your note-taking workspace.
                </p>
                <div className="space-y-4">
                    <p>Onboarding flow coming soon...</p>
                    <a
                        href="/notes"
                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Continue to Notes
                    </a>
                </div>
            </div>
        </div>
    )
} 