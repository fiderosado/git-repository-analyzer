import React, { useState } from 'react';
import { GitBranch, Search, AlertCircle } from 'lucide-react';

interface RepositoryFormProps {
  onSubmit: (repoUrl: string) => void;
  loading: boolean;
  error: string | null;
}

export default function RepositoryForm({ onSubmit, loading, error }: RepositoryFormProps) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onSubmit(repoUrl.trim());
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <GitBranch className="text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Connect to Repository</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <input
              type="text"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <AlertCircle className="text-red-400" size={16} />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !repoUrl.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Analyzing Repository...
            </>
          ) : (
            <>
              <Search size={16} />
              Analyze Repository
            </>
          )}
        </button>
      </form>
    </div>
  );
}