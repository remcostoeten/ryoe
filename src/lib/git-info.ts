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
