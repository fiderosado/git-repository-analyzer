import React from 'react';
import { Calendar, User, MessageSquare, ExternalLink } from 'lucide-react';
import { Commit } from '@/types/git';
import { format } from 'date-fns';

interface CommitsListProps {
  commits: Commit[];
  loading: boolean;
}

export default function CommitsList({ commits, loading }: CommitsListProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="text-purple-400" size={20} />
          <h3 className="text-lg font-medium text-white">Recent Commits</h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="text-purple-400" size={20} />
        <h3 className="text-lg font-medium text-white">Recent Commits</h3>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
          {commits.length}
        </span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {commits.slice(0, 20).map((commit) => (
          <div key={commit.sha} className="border-l-2 border-purple-500 pl-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium leading-tight mb-2 break-words">
                  {commit.commit.message.split('\n')[0]}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{commit.commit.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{format(new Date(commit.commit.author.date), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
              <a
                href={commit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}