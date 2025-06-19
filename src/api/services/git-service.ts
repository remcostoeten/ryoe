import { useQuery } from '@tanstack/react-query'
import { fetchLatestCommitInfo } from '@/core/git/git-info'
import { fetchGitTree } from '@/components/layout/footer/git-tree'
import type { GitCommitInfo } from '@/core/git/git-info'

// Query Keys
export const GIT_QUERY_KEYS = {
    LATEST_COMMIT: (owner: string, repo: string, branch: string) => ['git', 'commit', owner, repo, branch] as const,
    GIT_TREE: (repoUrl: string, branch: string, maxCommits: number) => ['git', 'tree', repoUrl, branch, maxCommits] as const,
} as const

// Query Hooks
export function useLatestCommit(
    owner: string = 'remcostoeten',
    repo: string = 'ryoe',
    branch: string = 'master',
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: GIT_QUERY_KEYS.LATEST_COMMIT(owner, repo, branch),
        queryFn: () => fetchLatestCommitInfo(owner, repo, branch),
        enabled: options?.enabled !== false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    })
}

export function useGitTree(
    repoUrl: string,
    branch: string = 'master',
    maxCommits: number = 10,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: GIT_QUERY_KEYS.GIT_TREE(repoUrl, branch, maxCommits),
        queryFn: () => fetchGitTree(repoUrl, branch, maxCommits),
        enabled: options?.enabled !== false,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    })
} 