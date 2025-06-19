// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { createUser } from '@/api'
// import { toast } from '@/components/ui/toast'

// export function UserCreationForm() {
//     const [name, setName] = useState('')
//     const [snippetsPath, setSnippetsPath] = useState('')
//     const [isLoading, setIsLoading] = useState(false)

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()

//         if (!name || !snippetsPath) {
//             toast.error('Please fill in all required fields')
//             return
//         }

//         setIsLoading(true)

//         try {
//             const userId = await createUser(name, snippetsPath)
//             toast.success(
//                 `User ${name} created successfully with ID: ${userId}`
//             )

//             // Reset form
//             setName('')
//             setSnippetsPath('')
//         } catch (error) {
//             toast.error(
//                 error instanceof Error ? error.message : 'Unknown error'
//             )
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
//             <div className="space-y-2">
//                 <Label htmlFor="name">Name</Label>
//                 <Input
//                     id="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Enter your name"
//                     required
//                 />
//             </div>

//             <div className="space-y-2">
//                 <Label htmlFor="snippetsPath">Snippets Path</Label>
//                 <Input
//                     id="snippetsPath"
//                     value={snippetsPath}
//                     onChange={(e) => setSnippetsPath(e.target.value)}
//                     placeholder="Enter path for snippets"
//                     required
//                 />
//             </div>

//             <Button type="submit" disabled={isLoading} className="w-full">
//                 {isLoading ? 'Creating...' : 'Create User'}
//             </Button>
//         </form>
//     )
// }

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createUser } from "@/api/db"
import { Loader2, User, FolderOpen } from "lucide-react"

export function UserCreationForm() {
  const [name, setName] = useState("")
  const [snippetsPath, setSnippetsPath] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; userId?: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !snippetsPath.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const userId = await createUser(name.trim(), snippetsPath.trim())
      setResult({
        success: true,
        message: `User created successfully with ID: ${userId}`,
        userId,
      })
      setName("")
      setSnippetsPath("")
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create user",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          <User className="h-5 w-5" />
          Create New User
        </CardTitle>
        <CardDescription className="text-gray-400">
          Add a new user to the database with their snippets path
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snippetsPath" className="text-gray-300">
              Snippets Path
            </Label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="snippetsPath"
                type="text"
                placeholder="/path/to/snippets"
                value={snippetsPath}
                onChange={(e) => setSnippetsPath(e.target.value)}
                disabled={isLoading}
                className="pl-10 bg-gray-800/50 border-gray-600 text-gray-200 placeholder:text-gray-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !name.trim() || !snippetsPath.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded-lg border ${
              result.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <div className="text-sm font-medium">{result.success ? "Success!" : "Error"}</div>
            <div className="text-xs mt-1 opacity-90">{result.message}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
