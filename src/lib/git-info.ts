/**
 * Git information utilities
 * These would typically be populated during build time
 */

import { appConfig } from '@/app/config'
import { createHttpClient } from './http-client'

// Create a cached HTTP client for GitHub API calls
const githubClient = createHttpClient({
    headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ryoe-app'
    },
    cacheTtl: 10 * 60 * 1000 // 10 minutes cache for git info
})

// Extract owner and repo from repository URL
function parseRepositoryUrl(url: string) {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace('.git', '')
        }
    }
    return { owner: 'remcostoeten', repo: 'ryoe' }
}

// These would be injected during build process
export const gitInfo = {
    commitHash: import.meta.env.VITE_GIT_COMMIT_HASH || 'dev',
    commitMessage:
        import.meta.env.VITE_GIT_COMMIT_MESSAGE || 'Development build',
    commitDate:
        import.meta.env.VITE_GIT_COMMIT_DATE || new Date().toISOString(),
    branch: import.meta.env.VITE_GIT_BRANCH || 'main',
    isDirty: import.meta.env.VITE_GIT_DIRTY === 'true'
} as const

// Types for GitHub API responses
interface GitHubCommitResponse {
    sha: string
    commit: {
        message: string
        author: {
            name: string
            email: string
            date: string
        }
        committer: {
            name: string
            email: string
            date: string
        }
    }
    author?: {
        login: string
        avatar_url: string
    }
    committer?: {
        login: string
        avatar_url: string
    }
    parents: Array<{
        sha: string
    }>
}

export interface GitCommitInfo {
    commitHash: string
    commitMessage: string
    commitDate: string
    author: string
    authorAvatar?: string | null
    authorUsername?: string
    branch: string
}

// GitHub API client to fetch latest commit info
export async function fetchLatestCommitInfo(
    owner?: string,
    repo?: string,
    branch = 'master' // Try master first, then main
) {
    // Parse from config if not provided
    const { owner: configOwner, repo: configRepo } = parseRepositoryUrl(appConfig.repository)
    const finalOwner = owner || configOwner
    const finalRepo = repo || configRepo
    const branches = [branch, 'master', 'main']

    for (const branchName of branches) {
        try {
            console.log(`Trying to fetch from branch: ${branchName}`)
            const data = await githubClient.get<GitHubCommitResponse>(
                `https://api.github.com/repos/${finalOwner}/${finalRepo}/commits/${branchName}`
            )

            console.log('Successfully fetched commit data:', {
                hash: data.sha.substring(0, 7),
                message: data.commit.message.split('\n')[0],
                date: data.commit.author.date
            })
            return {
                commitHash: data.sha,
                commitMessage: data.commit.message,
                commitDate: data.commit.author.date,
                author: data.commit.author.name,
                authorAvatar: data.author?.avatar_url || data.committer?.avatar_url,
                authorUsername: data.author?.login || data.committer?.login,
                branch: branchName
            }
        } catch (error) {
            console.warn(`Failed to fetch from branch ${branchName}:`, error)
            continue
        }
    }

    // If all branches fail, fall back to build-time values
    console.warn('All GitHub API attempts failed, using fallback values')
    return {
        commitHash: gitInfo.commitHash,
        commitMessage: gitInfo.commitMessage,
        commitDate: gitInfo.commitDate,
        author: 'Remco Stoeten',
        authorAvatar: null,
        authorUsername: 'remcostoeten',
        branch: 'unknown'
    }
}

// Fetch commit history for git tree visualization
export async function fetchCommitHistory(
    owner?: string,
    repo?: string,
    branch = 'master',
    maxCommits = 10
): Promise<GitCommitInfo[]> {
    // Parse from config if not provided
    const { owner: configOwner, repo: configRepo } = parseRepositoryUrl(appConfig.repository)
    const finalOwner = owner || configOwner
    const finalRepo = repo || configRepo
    const branches = [branch, 'master', 'main']

    for (const branchName of branches) {
        try {
            console.log(`Fetching commit history from branch: ${branchName}`)
            const commits = await githubClient.get<GitHubCommitResponse[]>(
                `https://api.github.com/repos/${finalOwner}/${finalRepo}/commits?sha=${branchName}&per_page=${maxCommits}`
            )

            return commits.map(commit => ({
                commitHash: commit.sha,
                commitMessage: commit.commit.message.split('\n')[0], // First line only
                commitDate: commit.commit.author.date,
                author: commit.commit.author.name,
                authorAvatar: commit.author?.avatar_url || commit.committer?.avatar_url,
                authorUsername: commit.author?.login || commit.committer?.login || commit.commit.author.name,
                branch: branchName
            }))
        } catch (error) {
            console.warn(`Failed to fetch commit history from branch ${branchName}:`, error)
            continue
        }
    }

    // If all branches fail, return empty array
    console.warn('All GitHub API attempts failed for commit history')
    return []
}

export function getShortCommitHash(): string {
    return gitInfo.commitHash.substring(0, 7)
}

export function getCommitInfo(): string {
    if (gitInfo.commitHash === 'dev') {
        return 'Development build'
    }

    const shortHash = getShortCommitHash()
    const isDirty = gitInfo.isDirty ? '*' : ''
    return `${shortHash}${isDirty}`
}

export function getLastCommitDate(): string {
    return new Date(gitInfo.commitDate).toLocaleDateString()
}

export function getBuildInfo(): string {
    const commitInfo = getCommitInfo()
    const date = getLastCommitDate()
    return `${commitInfo} • ${date}`
}

// New function to get real-time build info
export async function getRealtimeBuildInfo(): Promise<string> {
    const commit = await fetchLatestCommitInfo()
    const shortHash = commit.commitHash.substring(0, 7)
    const date = new Date(commit.commitDate).toLocaleDateString()
    return `${shortHash} • ${date}`
}

// Test function for debugging - call from browser console
export async function testGitHubAPI() {
    console.log('Testing GitHub API...')
    console.log('Repository URL:', appConfig.repository)

    const { owner, repo } = parseRepositoryUrl(appConfig.repository)
    console.log('Parsed owner:', owner)
    console.log('Parsed repo:', repo)

    try {
        const result = await fetchLatestCommitInfo()
        console.log('API Result:', result)
        return result
    } catch (error) {
        console.error('API Error:', error)
        return null
    }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
    ;(window as typeof window & { testGitHubAPI: typeof testGitHubAPI }).testGitHubAPI = testGitHubAPI
}
