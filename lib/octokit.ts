import { Octokit } from '@octokit/rest';
export function createOctokit(token?: string): Octokit {
  return new Octokit({ auth: token, userAgent: 'dna-analyzer/1.0.0' });
}
