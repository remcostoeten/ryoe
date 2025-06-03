/**
 * Git information utilities
 * These would typically be populated during build time
 */

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

// GitHub API client to fetch latest commit info
export async function fetchLatestCommitInfo(
    owner = 'remcostoeten',
    repo = 'notr-tauri'
) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits/main`
        )
        if (!response.ok) throw new Error('Failed to fetch commit info')

        const data = await response.json()
        return {
            commitHash: data.sha,
            commitMessage: data.commit.message,
            commitDate: data.commit.author.date,
            author: data.commit.author.name
        }
    } catch (error) {
        console.warn('Failed to fetch latest commit info:', error)
        // Fall back to build-time values
        return {
            commitHash: gitInfo.commitHash,
            commitMessage: gitInfo.commitMessage,
            commitDate: gitInfo.commitDate,
            author: 'Remco Stoeten'
        }
    }
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
