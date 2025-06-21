import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import { cn } from '@/shared/utils'

export default function NotesPage() {
	return (
		<div className='flex h-screen bg-gradient-to-br from-background via-background/98 to-muted/5'>
			<div className='flex-1 p-6'>
				<div className="h-full flex flex-col">
					<div className="flex-1 border border-border rounded-lg p-4">
						<p className="text-muted-foreground text-center">
							Select a note from the sidebar or create a new one
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
