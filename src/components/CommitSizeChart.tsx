import React, { useMemo } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import { FileText, TrendingUp } from 'lucide-react';
import { Commit } from '../types/git';
import { format, parseISO } from 'date-fns';

interface CommitSizeChartProps {
  commits: Commit[];
  loading: boolean;
}

export default function CommitSizeChart({ commits, loading }: CommitSizeChartProps) {
  const { messageLengthData, commitFrequencyData } = useMemo(() => {
    if (!commits.length) return { messageLengthData: [], commitFrequencyData: [] };

    // Message length analysis
    const messageLengthData = commits.map((commit, index) => ({
      x: index,
      y: commit.commit.message.length,
      date: format(parseISO(commit.commit.author.date), 'MMM d, yyyy'),
      message: commit.commit.message.split('\n')[0],
    }));

    // Commit frequency (commits per day)
    const commitsByDate = commits.reduce((acc, commit) => {
      const date = format(parseISO(commit.commit.author.date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commitFrequencyData = Object.entries(commitsByDate)
      .map(([date, count]) => ({ x: date, y: count }))
      .sort((a, b) => a.x.localeCompare(b.x));

    return { messageLengthData, commitFrequencyData };
  }, [commits]);

  const messageLengthChartData = {
    datasets: [{
      label: 'Message Length (characters)',
      data: messageLengthData,
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      pointBackgroundColor: 'rgb(168, 85, 247)',
      pointBorderColor: 'rgb(168, 85, 247)',
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const frequencyChartData = {
    datasets: [{
      label: 'Commits per Day',
      data: commitFrequencyData,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(229, 231, 235)',
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const point = messageLengthData[context[0].dataIndex];
            return point.date;
          },
          label: (context: any) => {
            const point = messageLengthData[context.dataIndex];
            return [
              `Length: ${context.parsed.y} characters`,
              `Message: ${point.message.substring(0, 50)}${point.message.length > 50 ? '...' : ''}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Commit Index',
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Message Length',
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(229, 231, 235)',
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d',
          },
        },
        title: {
          display: true,
          text: 'Date',
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Commits per Day',
          color: 'rgb(156, 163, 175)',
        },
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
            <FileText className="text-purple-400\" size={20} />
            <h3 className="text-lg font-medium text-white">Commit Message Length</h3>
          </div>
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="text-lg font-medium text-white">Daily Commit Frequency</h3>
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
          <FileText className="text-purple-400" size={20} />
          <h3 className="text-lg font-medium text-white">Commit Message Length Analysis</h3>
        </div>
        <div className="h-64">
          <Scatter data={messageLengthChartData} options={scatterOptions} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-green-400" size={20} />
          <h3 className="text-lg font-medium text-white">Daily Commit Frequency</h3>
        </div>
        <div className="h-64">
          <Line data={frequencyChartData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}