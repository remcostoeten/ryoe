import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createUser } from '@/api/db'
import { toast } from '@/components/ui/toast'

export function UserCreationForm() {
    const [name, setName] = useState('')
    const [snippetsPath, setSnippetsPath] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !snippetsPath) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsLoading(true)

        try {
            const userId = await createUser(name, snippetsPath)
            toast.success(
                `User ${name} created successfully with ID: ${userId}`
            )

            // Reset form
            setName('')
            setSnippetsPath('')
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Unknown error'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="snippetsPath">Snippets Path</Label>
                <Input
                    id="snippetsPath"
                    value={snippetsPath}
                    onChange={(e) => setSnippetsPath(e.target.value)}
                    placeholder="Enter path for snippets"
                    required
                />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create User'}
            </Button>
        </form>
    )
}
