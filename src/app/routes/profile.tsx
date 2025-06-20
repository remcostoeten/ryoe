import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser } from '@/hooks/use-onboarding'
import { User, Database, Settings, HardDrive, Palette } from 'lucide-react'

export function ProfilePage() {
	const { user, isLoading } = useCurrentUser()

	if (isLoading) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<div className="text-center">No user found</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
						<p className="text-muted-foreground">View your account settings and preferences</p>
					</div>
					<Badge variant="outline" className="flex items-center gap-2">
						<User className="w-4 h-4" />
						{user.storageType === 'local' ? 'Local Storage' : 'Cloud Storage'}
					</Badge>
				</div>

				{/* User Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							User Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								<div className="p-2 bg-muted/30 rounded border font-mono text-sm">
									{user.name}
								</div>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Snippets Path</label>
								<div className="p-2 bg-muted/30 rounded border font-mono text-sm">
									{user.snippetsPath}
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
							<div className="flex items-center gap-2">
								<Badge variant={user.isSetupComplete ? "default" : "secondary"}>
									{user.isSetupComplete ? "Setup Complete" : "Setup Pending"}
								</Badge>
							</div>
							<div className="text-sm text-muted-foreground">
								Created: {new Date(user.createdAt).toLocaleDateString()}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Storage Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="w-5 h-5" />
							Storage Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between p-4 rounded-lg border">
							<div className="flex items-center gap-3">
								<HardDrive className="w-5 h-5 text-muted-foreground" />
								<div>
									<h4 className="font-medium">Storage Type</h4>
									<p className="text-sm text-muted-foreground">
										{user.storageType === 'local' ? 'Local SQLite database' : 'Turso cloud database'}
									</p>
								</div>
							</div>
							<Badge variant="outline">
								{user.storageType.charAt(0).toUpperCase() + user.storageType.slice(1)}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* User Preferences */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="w-5 h-5" />
							Preferences
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="flex items-center gap-2 text-sm font-medium">
										<Palette className="w-4 h-4" />
										Theme
									</label>
									<Badge variant="outline">{user.preferences.theme}</Badge>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Sidebar Collapsed</label>
									<Badge variant="outline">
										{user.preferences.sidebarCollapsed ? 'Yes' : 'No'}
									</Badge>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Auto Save</label>
									<Badge variant="outline">
										{user.preferences.autoSave ? 'Enabled' : 'Disabled'}
									</Badge>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Line Numbers</label>
									<Badge variant="outline">
										{user.preferences.showLineNumbers ? 'Show' : 'Hide'}
									</Badge>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Font Size</label>
									<Badge variant="outline">{user.preferences.fontSize}px</Badge>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm font-medium">Editor Theme</label>
									<Badge variant="outline">{user.preferences.editorTheme}</Badge>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export const Component = ProfilePage
