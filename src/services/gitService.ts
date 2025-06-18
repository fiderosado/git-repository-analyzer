import { Repository, Branch, Commit } from '../types/git';

const GITHUB_API_BASE = 'https://api.github.com';

class GitService {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private parseRepoUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/,
      /github\.com\/([^\/]+)\/([^\/]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }
    return null;
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getRepository(repoUrl: string): Promise<Repository> {
    const parsed = this.parseRepoUrl(repoUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub repository URL');
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${parsed.owner}/${parsed.repo}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please check your access token.');
      } else if (response.status === 404) {
        throw new Error('Repository not found. Please check the URL and your access permissions.');
      } else {
        throw new Error(`Repository access failed: ${response.statusText}`);
      }
    }

    return response.json();
  }

  async getBranches(owner: string, repo: string): Promise<Branch[]> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to fetch branches.');
      }
      throw new Error(`Failed to fetch branches: ${response.statusText}`);
    }

    return response.json();
  }

  async getCommits(owner: string, repo: string, branch: string = 'main', page: number = 1): Promise<Commit[]> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${branch}&page=${page}&per_page=100`,
      {
        headers: this.getHeaders(),
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required to fetch commits.');
      }
      throw new Error(`Failed to fetch commits: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllCommits(owner: string, repo: string, branch: string = 'main'): Promise<Commit[]> {
    let allCommits: Commit[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) { // Limit to 10 pages to avoid excessive API calls
      try {
        const commits = await this.getCommits(owner, repo, branch, page);
        if (commits.length === 0) {
          hasMore = false;
        } else {
          allCommits = [...allCommits, ...commits];
          page++;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        hasMore = false;
      }
    }

    return allCommits;
  }

  async getRateLimit(): Promise<{ remaining: number; limit: number; reset: Date }> {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rate limit information');
    }

    const data = await response.json();
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    };
  }
}

export default new GitService();