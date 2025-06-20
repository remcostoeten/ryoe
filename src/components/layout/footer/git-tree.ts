import { createHttpClient } from '@/core/http-client'

// Create a cached HTTP client specifically for GitHub API calls
// Using a long TTL to avoid rate limiting
const githubClient = createHttpClient({
	headers: {
		Accept: 'application/vnd.github.v3+json',
	},
	cacheTtl: 30 * 60 * 1000, // 30 minutes cache
})

export interface GitCommit {
	sha: string
	shortSha: string
	message: string
	date: string
	author: string
	authorAvatar: string
	authorUsername: string
	parents: string[]
	branchType: 'master' | 'feature' | 'merge' | 'hotfix'
	branchColor: string
}

export interface GitBranch {
	name: string
	commit: string
}

// Branch color palette - aesthetically pleasing colors for dark theme
const BRANCH_COLORS = {
	master: '#88c0d0', // Nord frost blue
	feature: '#a3be8c', // Nord green
	merge: '#d08770', // Nord orange
	hotfix: '#bf616a', // Nord red
	secondary: '#b48ead', // Nord purple
	tertiary: '#ebcb8b', // Nord yellow
} as const

const BRANCH_COLOR_PALETTE = [
	BRANCH_COLORS.master,
	BRANCH_COLORS.feature,
	BRANCH_COLORS.secondary,
	BRANCH_COLORS.tertiary,
	BRANCH_COLORS.merge,
	BRANCH_COLORS.hotfix,
]

// Parse repository URL to get owner and repo
function parseRepositoryUrl(url: string) {
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
	if (match) {
		return {
			owner: match[1],
			repo: match[2].replace('.git', ''),
		}
	}
	return { owner: 'remcostoeten', repo: 'ryoe' }
}

// Detect branch type based on commit patterns
function detectBranchType(commit: any, index: number, _allCommits: any[]): GitCommit['branchType'] {
	const message = commit.commit.message.toLowerCase()

	// Check for merge commits
	if (commit.parents.length > 1) {
		return 'merge'
	}

	// Check for hotfix patterns
	if (message.includes('hotfix') || message.includes('fix:') || message.includes('patch')) {
		return 'hotfix'
	}

	// Check for feature patterns
	if (message.includes('feat:') || message.includes('feature') || message.includes('add:')) {
		return 'feature'
	}

	// master branch (first few commits or conventional patterns)
	if (
		index < 3 ||
		message.includes('release') ||
		message.includes('version') ||
		message.includes('initial')
	) {
		return 'master'
	}

	// Default to feature for other commits
	return 'feature'
}

// Assign colors based on branch lanes and types
function assignBranchColor(branchType: GitCommit['branchType'], laneIndex: number): string {
	switch (branchType) {
		case 'master':
			return BRANCH_COLORS.master
		case 'merge':
			return BRANCH_COLORS.merge
		case 'hotfix':
			return BRANCH_COLORS.hotfix
		case 'feature':
			// Cycle through colors for different feature branches
			return BRANCH_COLOR_PALETTE[laneIndex % BRANCH_COLOR_PALETTE.length]
		default:
			return BRANCH_COLORS.feature
	}
}

// Fetch commit history for visualization
export async function fetchGitTree(
	repoUrl: string,
	branch = 'master',
	maxCommits = 10
): Promise<GitCommit[]> {
	const { owner, repo } = parseRepositoryUrl(repoUrl)

	try {
		// First try the specified branch
		const commits = await githubClient.get<any[]>(
			`https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${maxCommits}`
		)

		return commits.map((commit, index) => {
			const branchType = detectBranchType(commit, index, commits)

			// Extract author information including avatar
			const authorAvatar =
				commit.author?.avatar_url ||
				'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
			const authorUsername = commit.author?.login || commit.commit.author.name || 'unknown'

			return {
				sha: commit.sha,
				shortSha: commit.sha.substring(0, 7),
				message: commit.commit.message.split('\n')[0],
				date: commit.commit.author.date,
				author: commit.commit.author.name,
				authorAvatar,
				authorUsername,
				parents: commit.parents.map((parent: any) => parent.sha),
				branchType,
				branchColor: assignBranchColor(branchType, index),
			}
		})
	} catch (error) {
		console.warn(`Failed to fetch git tree for ${branch}:`, error)

		// Try master as fallback
		if (branch !== 'master') {
			try {
				return await fetchGitTree(repoUrl, 'master', maxCommits)
			} catch {
				// If master fails too, return empty array
				return []
			}
		}

		return []
	}
}

// Calculate positions for the git tree visualization with branch lanes
export function calculateTreePositions(
	commits: Array<{
		commitHash?: string
		sha?: string
		commitMessage?: string
		message?: string
		branchType: 'master' | 'feature' | 'merge' | 'hotfix'
		parents?: string[]
	}>
) {
	const positions: Record<string, { x: number; y: number; lane: number }> = {}
	const lanes: Record<string, number> = {}
	const branchLanes: Record<string, number> = {}
	let maxLane = 0

	// First pass: assign lanes based on branch types and relationships
	commits.forEach((commit, index) => {
		let assignedLane = 0

		if (commit.branchType === 'master') {
			// master branch always gets lane 0
			assignedLane = 0
		} else if (commit.parents && commit.parents.length > 0) {
			// Check if parent already has a lane
			const parentLanes = commit.parents
				.map((p: string) => lanes[p])
				.filter((lane: number) => lane !== undefined)

			if (parentLanes.length > 0) {
				// For merge commits, use the master parent's lane
				if (commit.branchType === 'merge') {
					assignedLane = Math.min(...parentLanes)
				} else {
					assignedLane = parentLanes[0]
				}
			} else {
				// New branch - assign next available lane
				maxLane += 1
				assignedLane = maxLane
			}
		} else {
			// Root commit
			assignedLane = 0
		}

		// For feature branches, try to group similar types
		if (commit.branchType === 'feature' || commit.branchType === 'hotfix') {
			const message = commit.commitMessage || commit.message || ''
			const branchKey = `${commit.branchType}-${message.split(':')[0]}`
			if (branchLanes[branchKey] !== undefined) {
				assignedLane = branchLanes[branchKey]
			} else {
				branchLanes[branchKey] = assignedLane
			}
		}

		const commitId = commit.commitHash || commit.sha || `commit-${index}`
		lanes[commitId] = assignedLane
		maxLane = Math.max(maxLane, assignedLane)

		// Position based on lane and index
		positions[commitId] = {
			x: assignedLane * 45,
			y: index * 60, // Increased spacing for avatars
			lane: assignedLane,
		}
	})

	return { positions, lanes, maxLane }
}

// Get branch type display info
export function getBranchTypeInfo(branchType: GitCommit['branchType']) {
	const info = {
		master: { label: 'master', icon: '●' },
		feature: { label: 'Feature', icon: '◆' },
		merge: { label: 'Merge', icon: '◉' },
		hotfix: { label: 'Hotfix', icon: '▲' },
	}

	return info[branchType] || info.feature
}
