import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Users, Award } from 'lucide-react';
import { Commit } from '../types/git';

interface ContributorChartProps {
  commits: Commit[];
  loading: boolean;
}

export default function ContributorChart({ commits, loading }: ContributorChartProps) {
  const { contributorData, topContributors } = useMemo(() => {
    if (!commits.length) return { contributorData: [], topContributors: [] };

    const contributorStats = commits.reduce((acc, commit) => {
      const author = commit.commit.author.name;
      if (!acc[author]) {
        acc[author] = {
          name: author,
          commits: 0,
          avatar: commit.author?.avatar_url || null,
        };
      }
      acc[author].commits++;
      return acc;
    }, {} as Record<string, { name: string; commits: number; avatar: string | null }>);

    const sortedContributors = Object.values(contributorStats)
      .sort((a, b) => b.commits - a.commits);

    const topContributors = sortedContributors.slice(0, 10);
    
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    const contributorData = {
      labels: topContributors.map(c => c.name),
      datasets: [{
        data: topContributors.map(c => c.commits),
        backgroundColor: colors.slice(0, topContributors.length),
        borderColor: colors.slice(0, topContributors.length),
        borderWidth: 2,
      }]
    };

    return { contributorData, topContributors };
  }, [commits]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(229, 231, 235)',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} commits (${percentage}%)`;
          },
        },
      },
    },
  };

  const barChartData = {
    labels: topContributors.map(c => c.name),
    datasets: [{
      label: 'Commits',
      data: topContributors.map(c => c.commits),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxRotation: 45,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-400\" size={20} />
            <h3 className="text-lg font-medium text-white">Contributors Distribution</h3>
          </div>
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-yellow-400" size={20} />
            <h3 className="text-lg font-medium text-white">Top Contributors</h3>
          </div>
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-blue-400" size={20} />
          <h3 className="text-lg font-medium text-white">Contributors Distribution</h3>
        </div>
        <div className="h-64">
          <Doughnut data={contributorData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-yellow-400" size={20} />
          <h3 className="text-lg font-medium text-white">Top Contributors</h3>
        </div>
        <div className="h-64">
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}