import React, { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface TokenFormProps {
  token: string;
  onTokenChange: (token: string) => void;
  onTokenSave: () => void;
  isValid: boolean | null;
  loading?: boolean;
}

export default function TokenForm({ token, onTokenChange, onTokenSave, isValid, loading }: TokenFormProps) {
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTokenSave();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Key className="text-yellow-400" size={24} />
        <h2 className="text-xl font-semibold text-white">GitHub Authentication</h2>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-400 mt-0.5" size={16} />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-2">GitHub Personal Access Token Required</p>
            <p className="mb-3">
              To access repository data, you need a GitHub Personal Access Token with 'repo' permissions.
            </p>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=Git%20Repository%20Analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={14} />
              Create Token on GitHub
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
            Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              id="token"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={loading}
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {isValid !== null && (
                <div className="flex items-center">
                  {isValid ? (
                    <CheckCircle className="text-green-400\" size={16} />
                  ) : (
                    <AlertCircle className="text-red-400" size={16} />
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {isValid === false && (
            <p className="text-red-400 text-sm mt-2">Invalid token or insufficient permissions</p>
          )}
          {isValid === true && (
            <p className="text-green-400 text-sm mt-2">Token validated successfully</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!token.trim() || loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Validating Token...
            </>
          ) : (
            <>
              <Key size={16} />
              Save Token
            </>
          )}
        </button>
      </form>
    </div>
  );
}