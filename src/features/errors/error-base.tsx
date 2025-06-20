interface ErrorViewProps {
    children: React.ReactNode
}

interface ErrorHeaderProps {
    children: React.ReactNode
}

interface ErrorDescriptionProps {
    children: React.ReactNode
}

interface ErrorActionsProps {
    children: React.ReactNode
}

export function ErrorView({ children }: ErrorViewProps) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="text-center max-w-md">
                {children}
            </div>
        </div>
    )
}

export function ErrorHeader({ children }: ErrorHeaderProps) {
    return (
        <h1 className="text-4xl font-bold text-foreground mb-4">
            {children}
        </h1>
    )
}

export function ErrorDescription({ children }: ErrorDescriptionProps) {
    return (
        <p className="text-muted-foreground mb-8 text-lg">
            {children}
        </p>
    )
}

export function ErrorActions({ children }: ErrorActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {children}
        </div>
    )
} 