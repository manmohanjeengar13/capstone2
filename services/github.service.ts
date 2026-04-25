import { createOctokit } from '@/lib/octokit';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import type { GithubRepo, GithubCommit, GithubContributor, GithubTree } from '@/types/github';

export async function getRepoMetadata(owner: string, repo: string, token?: string): Promise<GithubRepo> {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      url: data.html_url,
      description: data.description,
      language: data.language ?? null,
      stars: data.stargazers_count,
      forks: data.forks_count,
      size: data.size,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      pushedAt: data.pushed_at ?? new Date().toISOString(),
      isPrivate: data.private,
    };
  } catch (error) {
    handleGithubError(error, owner, repo);
  }
}

export async function getLanguages(owner: string, repo: string, token?: string): Promise<Record<string, number>> {
  const { data } = await createOctokit(token).rest.repos.listLanguages({ owner, repo });
  return data as Record<string, number>;
}

/**
 * Fetches up to `max` commits for a repository.
 *
 * The list-commits endpoint does not return per-file diff stats, so we fetch
 * each commit individually to populate `additions` and `deletions`. This is
 * intentionally capped via the `max` parameter to limit API usage — set max
 * conservatively for large repos or switch to the GitHub GraphQL API for
 * bulk stat retrieval.
 */
export async function getCommits(owner: string, repo: string, max = 500, token?: string): Promise<GithubCommit[]> {
  const octokit = createOctokit(token);
  const shas: { sha: string; message: string; authorLogin: string | null; authorEmail: string; authorName: string; committedAt: string }[] = [];
  let page = 1;

  while (shas.length < max) {
    const { data } = await octokit.rest.repos.listCommits({ owner, repo, per_page: 100, page });
    if (!data.length) break;

    for (const c of data) {
      if (shas.length >= max) break;
      shas.push({
        sha: c.sha,
        message: c.commit.message ?? '',
        authorLogin: c.author?.login ?? null,
        authorEmail: c.commit.author?.email ?? '',
        authorName: c.commit.author?.name ?? '',
        committedAt: c.commit.committer?.date ?? c.commit.author?.date ?? new Date().toISOString(),
      });
    }

    if (data.length < 100) break;
    page++;
  }

  // Fetch diff stats for each commit. Runs serially to stay within secondary
  // rate limits; parallelise with a concurrency limiter if throughput matters.
  const commits: GithubCommit[] = [];
  for (const base of shas) {
    try {
      const { data: detail } = await octokit.rest.repos.getCommit({ owner, repo, ref: base.sha });
      commits.push({
        ...base,
        additions: detail.stats?.additions ?? 0,
        deletions: detail.stats?.deletions ?? 0,
      });
    } catch {
      // If the individual stat fetch fails, record zero rather than aborting
      commits.push({ ...base, additions: 0, deletions: 0 });
    }
  }

  logger.debug(`Fetched ${commits.length} commits with stats for ${owner}/${repo}`);
  return commits;
}

export async function getFileTree(owner: string, repo: string, treeSha: string, token?: string): Promise<GithubTree> {
  const { data } = await createOctokit(token).rest.git.getTree({ owner, repo, tree_sha: treeSha, recursive: '1' });
  return {
    sha: data.sha,
    truncated: data.truncated ?? false,
    tree: (data.tree ?? [])
      .filter(e => e.path && e.type && e.sha)
      .map(e => ({ path: e.path!, type: e.type as 'blob' | 'tree', size: e.size, sha: e.sha! })),
  };
}

export async function getContributors(owner: string, repo: string, token?: string): Promise<GithubContributor[]> {
  try {
    const { data } = await createOctokit(token).rest.repos.listContributors({ owner, repo, per_page: 100 });
    return (data ?? []).map(c => ({
      login: c.login ?? 'unknown',
      avatarUrl: c.avatar_url ?? '',
      contributions: c.contributions,
      htmlUrl: c.html_url ?? '',
    }));
  } catch {
    return [];
  }
}

export async function searchUserRepos(query: string, login: string, token?: string): Promise<GithubRepo[]> {
  const q = login ? `${query} user:${login}` : query;
  try {
    const { data } = await createOctokit(token).rest.search.repos({ q, per_page: 10, sort: 'updated', order: 'desc' });
    return data.items.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description ?? null,
      language: r.language ?? null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      size: r.size,
      defaultBranch: r.default_branch,
      createdAt: r.created_at ?? new Date().toISOString(),
      pushedAt: r.pushed_at ?? new Date().toISOString(),
      isPrivate: r.private,
    }));
  } catch {
    return [];
  }
}

function handleGithubError(error: unknown, owner: string, repo: string): never {
  if (error && typeof error === 'object' && 'status' in error) {
    const s = (error as { status: number }).status;
    if (s === 404) throw new AppError(`Repository ${owner}/${repo} not found or is private`, 404, 'ERR_REPO_NOT_FOUND');
    if (s === 403) throw new AppError('GitHub API rate limit exceeded.', 429, 'ERR_GITHUB_RATE_LIMIT');
    if (s === 401) throw new AppError('GitHub token is invalid or expired.', 401, 'ERR_GITHUB_UNAUTHORIZED');
  }
  throw new AppError('Failed to fetch repository data from GitHub', 502, 'ERR_GITHUB');
}