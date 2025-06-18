"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { Repository, Branch, Commit } from '../types/git';
import gitService from '../services/gitService';
import TokenForm from './TokenForm';
import RepositoryForm from './RepositoryForm';
import BranchSelector from './BranchSelector';
import CommitsList from './CommitsList';
import CommitsChart from './CommitsChart';
import CommitSizeChart from './CommitSizeChart';
import WeeklyPatternChart from './WeeklyPatternChart';
import { GitBranch, Star, Eye, Shield, BarChart3 } from 'lucide-react';

export default function GitAnalyzer() {
  const [token, setToken] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState({
    token: false,
    repository: false,
    branches: false,
    commits: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setToken(savedToken);
      gitService.setToken(savedToken);
      validateToken(savedToken);
    }
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    setLoading(prev => ({ ...prev, token: true }));
    try {
      gitService.setToken(tokenToValidate);
      const isValid = await gitService.validateToken();
      setTokenValid(isValid);
      if (!isValid) {
        setError('Invalid token or insufficient permissions');
      } else {
        setError(null);
      }
    } catch (err) {
      setTokenValid(false);
      setError('Failed to validate token');
    } finally {
      setLoading(prev => ({ ...prev, token: false }));
    }
  };

  const handleTokenSave = useCallback(async () => {
    if (!token.trim()) return;
    
    localStorage.setItem('github_token', token);
    await validateToken(token);
  }, [token]);

  const handleRepositorySubmit = useCallback(async (repoUrl: string) => {
    if (!tokenValid) {
      setError('Please provide a valid GitHub token first');
      return;
    }

    setLoading(prev => ({ ...prev, repository: true }));
    setError(null);
    
    try {
      const repo = await gitService.getRepository(repoUrl);
      setRepository(repo);
      
      // Load branches
      setLoading(prev => ({ ...prev, branches: true }));
      const branchesData = await gitService.getBranches(repo.owner.login, repo.name);
      setBranches(branchesData);
      
      // Set default branch
      const defaultBranch = branchesData.find(b => b.name === repo.default_branch) || branchesData[0];
      if (defaultBranch) {
        setSelectedBranch(defaultBranch.name);
        
        // Load commits for default branch
        setLoading(prev => ({ ...prev, commits: true }));
        const commitsData = await gitService.getAllCommits(repo.owner.login, repo.name, defaultBranch.name);
        setCommits(commitsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading({ repository: false, branches: false, commits: false, token: false });
    }
  }, [tokenValid]);

  const handleBranchChange = useCallback(async (branchName: string) => {
    if (!repository) return;
    
    setSelectedBranch(branchName);
    setLoading(prev => ({ ...prev, commits: true }));
    
    try {
      const commitsData = await gitService.getAllCommits(repository.owner.login, repository.name, branchName);
      setCommits(commitsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commits');
    } finally {
      setLoading(prev => ({ ...prev, commits: false }));
    }
  }, [repository]);

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="text-blue-400" size={32} />
            <h1 className="text-3xl font-bold">Git Repository Analyzer</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Analyze GitHub repositories, explore commits across branches, and visualize development patterns with interactive charts and comprehensive analytics.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          <TokenForm
            token={token}
            onTokenChange={setToken}
            onTokenSave={handleTokenSave}
            isValid={tokenValid}
            loading={loading.token}
          />

          {tokenValid && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Shield className="text-green-400" size={20} />
                <span className="text-green-300 font-medium">Authentication successful</span>
                <span className="text-green-400 text-sm">Ready to analyze repositories</span>
              </div>
            </div>
          )}

          {tokenValid && (
            <RepositoryForm
              onSubmit={handleRepositorySubmit}
              loading={loading.repository}
              error={error}
            />
          )}

          {repository && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {repository.full_name}
                  </h2>
                  {repository.description && (
                    <p className="text-gray-400 mb-3">{repository.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>Repository connected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>Default: {repository.default_branch}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {branches.length > 0 && (
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={handleBranchChange}
              loading={loading.branches}
            />
          )}

          {commits.length > 0 && (
            <>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-blue-400" size={24} />
                  <h2 className="text-xl font-semibold text-white">Repository Analytics Dashboard</h2>
                </div>
                <p className="text-gray-400">
                  Comprehensive analysis of {commits.length} commits from the {selectedBranch} branch
                </p>
              </div>

              {/* Commits Charts - Full width */}
              <CommitsChart commits={commits} loading={loading.commits} />

              {/* Weekly Pattern and Monthly Trends - Full width */}
              <WeeklyPatternChart commits={commits} loading={loading.commits} />

              {/* Commit Size Analysis - Full width */}
              <CommitSizeChart commits={commits} loading={loading.commits} />

              {/* Commits List */}
              <CommitsList commits={commits} loading={loading.commits} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}