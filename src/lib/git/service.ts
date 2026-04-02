import { Octokit } from '@octokit/rest';

interface GitConfig {
  provider: 'github' | 'gitlab' | 'bitbucket';
  token: string;
  owner: string;
}

interface CreateRepoOptions {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

interface PushOptions {
  repo: string;
  branch: string;
  commitMessage: string;
  files: { path: string; content: string }[];
}

export class GitService {
  private octokit: Octokit;
  private config: GitConfig;

  constructor(config: GitConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.token });
  }

  async createRepository(options: CreateRepoOptions) {
    if (this.config.provider === 'github') {
      const { data } = await this.octokit.repos.createForAuthenticatedUser({
        name: options.name,
        description: options.description,
        private: options.isPrivate ?? true,
        auto_init: true,
      });

      return {
        id: data.id,
        name: data.name,
        url: data.html_url,
        cloneUrl: data.clone_url,
        sshUrl: data.ssh_url,
      };
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }

  async pushFiles(options: PushOptions) {
    if (this.config.provider === 'github') {
      return this.pushToGitHub(options);
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }

  private async pushToGitHub(options: PushOptions) {
    const { repo, branch, commitMessage, files } = options;
    const owner = this.config.owner;

    try {
      const { data: refData } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      });

      const latestCommitSha = refData.object.sha;

      const { data: commitData } = await this.octokit.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha,
      });

      const baseTreeSha = commitData.tree.sha;

      const blobs = await Promise.all(
        files.map(async (file) => {
          const { data: blobData } = await this.octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          });
          return { path: file.path, sha: blobData.sha };
        })
      );

      const { data: newTree } = await this.octokit.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: blobs.map(blob => ({
          path: blob.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        })),
      });

      const { data: newCommit } = await this.octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [latestCommitSha],
      });

      await this.octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
      });

      return {
        commitSha: newCommit.sha,
        message: newCommit.message,
        timestamp: newCommit.committer?.date,
      };
    } catch (error) {
      console.error('GitHub push failed:', error);
      throw error;
    }
  }

  async getRepository(repo: string) {
    if (this.config.provider === 'github') {
      const { data } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo,
      });

      return {
        id: data.id,
        name: data.name,
        url: data.html_url,
        defaultBranch: data.default_branch,
        visibility: data.visibility,
      };
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }

  async listBranches(repo: string) {
    if (this.config.provider === 'github') {
      const { data } = await this.octokit.repos.listBranches({
        owner: this.config.owner,
        repo,
      });

      return data.map(branch => ({
        name: branch.name,
        commit: branch.commit.sha,
        protected: branch.protected,
      }));
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }

  async createBranch(repo: string, branchName: string, fromBranch: string = 'main') {
    if (this.config.provider === 'github') {
      const { data: refData } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo,
        ref: `heads/${fromBranch}`,
      });

      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      return { name: branchName, sha: refData.object.sha };
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }

  async getCommitHistory(repo: string, branch: string = 'main', perPage: number = 10) {
    if (this.config.provider === 'github') {
      const { data } = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo,
        sha: branch,
        per_page: perPage,
      });

      return data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name,
        timestamp: commit.commit.author?.date,
      }));
    }

    throw new Error(`Provider ${this.config.provider} not implemented`);
  }
}

export function createGitService(config: GitConfig) {
  return new GitService(config);
}
