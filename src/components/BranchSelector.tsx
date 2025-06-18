import React from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';
import { Branch } from '../types/git';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  loading: boolean;
}

export default function BranchSelector({ 
  branches, 
  selectedBranch, 
  onBranchChange, 
  loading 
}: BranchSelectorProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <GitBranch className="text-green-400" size={20} />
        <h3 className="text-lg font-medium text-white">Branch Selection</h3>
      </div>
      
      <div className="relative">
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          disabled={loading}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
        >
          {branches.map((branch) => (
            <option key={branch.name} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
      </div>
      
      <p className="text-sm text-gray-400 mt-2">
        {branches.length} branch{branches.length !== 1 ? 'es' : ''} available
      </p>
    </div>
  );
}