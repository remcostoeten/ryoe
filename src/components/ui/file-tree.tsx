import React from 'react'
import { cn } from '@/shared/utils'
import {
	Folder,
	FolderOpen,
	File,
	FileText,
	FileCode,
	Database,
	Settings,
	Package,
	Image,
	FileJson,
} from 'lucide-react'

export interface FileTreeNode {
	name: string
	type: 'file' | 'folder'
	children?: FileTreeNode[]
	isOpen?: boolean
	icon?: React.ComponentType<{ className?: string }>
	description?: string
	status?: 'done' | 'in-progress' | 'planned'
}

interface FileTreeProps {
	data: FileTreeNode[]
	className?: string
	showStatus?: boolean
}

interface FileTreeItemProps {
	node: FileTreeNode
	level: number
	showStatus?: boolean
}

const getFileIcon = (fileName: string): React.ComponentType<{ className?: string }> => {
	const ext = fileName.split('.').pop()?.toLowerCase()

	switch (ext) {
		case 'ts':
		case 'tsx':
		case 'js':
		case 'jsx':
			return FileCode
		case 'json':
			return FileJson
		case 'md':
		case 'mdx':
			return FileText
		case 'sql':
		case 'db':
			return Database
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'svg':
		case 'gif':
			return Image
		case 'toml':
		case 'yaml':
		case 'yml':
			return Settings
		default:
			if (fileName === 'package.json') return Package
			if (fileName === 'Cargo.toml') return Package
			if (fileName.startsWith('.')) return Settings
			return File
	}
}

const getStatusColor = (status?: string) => {
	switch (status) {
		case 'done':
			return 'text-green-600 dark:text-green-400'
		case 'in-progress':
			return 'text-yellow-600 dark:text-yellow-400'
		case 'planned':
			return 'text-blue-600 dark:text-blue-400'
		default:
			return 'text-muted-foreground'
	}
}

const getStatusIcon = (status?: string) => {
	switch (status) {
		case 'done':
			return '✅'
		case 'in-progress':
			return '🚧'
		case 'planned':
			return '📋'
		default:
			return ''
	}
}

const FileTreeItem = ({ node, level, showStatus }: FileTreeItemProps): React.ReactElement => {
	const [isOpen, setIsOpen] = React.useState(node.isOpen ?? false)

	const IconComponent =
		node.icon ||
		(node.type === 'folder' ? (isOpen ? FolderOpen : Folder) : getFileIcon(node.name))
	const hasChildren = node.children && node.children.length > 0

	const handleToggle = () => {
		if (node.type === 'folder' && hasChildren) {
			setIsOpen(!isOpen)
		}
	}

	const handleDoubleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (node.type === 'folder' && hasChildren) {
			setIsOpen(!isOpen)
		}
	}

	return (
		<div className='select-none'>
			<div
				className={cn(
					'flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors',
					level > 0 && 'ml-4'
				)}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
				onClick={handleToggle}
				onDoubleClick={handleDoubleClick}
			>
				{node.type === 'folder' && hasChildren && (
					<span className='text-muted-foreground text-xs'>{isOpen ? '▼' : '▶'}</span>
				)}
				{node.type === 'file' && <span className='w-3' />}

				<IconComponent
					className={cn(
						'h-4 w-4 flex-shrink-0',
						node.type === 'folder'
							? 'text-blue-600 dark:text-blue-400'
							: getStatusColor(node.status)
					)}
				/>

				<span
					className={cn(
						'text-sm font-mono',
						node.type === 'folder' ? 'font-medium' : 'font-normal',
						getStatusColor(node.status)
					)}
				>
					{node.name}
				</span>

				{showStatus && node.status && (
					<span className='ml-auto text-xs'>{getStatusIcon(node.status)}</span>
				)}

				{node.description && (
					<span className='ml-2 text-xs text-muted-foreground italic'>
						{node.description}
					</span>
				)}
			</div>

			{node.type === 'folder' && isOpen && hasChildren && (
				<div className='ml-2'>
					{node.children!.map((child, index) => (
						<FileTreeItem
							key={`${child.name}-${index}`}
							node={child}
							level={level + 1}
							showStatus={showStatus}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export const FileTree = ({ data, className, showStatus = false }: FileTreeProps): React.ReactElement => {
	return (
		<div
			className={cn(
				'bg-muted/30 rounded-lg border p-4 font-mono text-sm overflow-auto',
				className
			)}
		>
			{data.map((node, index) => (
				<FileTreeItem
					key={`${node.name}-${index}`}
					node={node}
					level={0}
					showStatus={showStatus}
				/>
			))}
		</div>
	)
}

export default FileTree
