"use client"
import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { format, parseISO, startOfDay } from 'date-fns';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Commit } from '@/types/git';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register all Chart.js components globally
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    RadialLinearScale,
    ArcElement
);

interface CommitsChartProps {
  commits: Commit[];
  loading: boolean;
}

export default function CommitsChart({ commits, loading }: CommitsChartProps) {
  const { dailyData, hourlyData } = useMemo(() => {
    if (!commits.length) return { dailyData: [], hourlyData: [] };

    // Daily commits
    const dailyCommits = commits.reduce((acc, commit) => {
      const date = format(startOfDay(parseISO(commit.commit.author.date)), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyData = Object.entries(dailyCommits)
      .map(([date, count]) => ({ x: date, y: count }))
      .sort((a, b) => a.x.localeCompare(b.x));

    // Hourly commits
    const hourlyCommits = commits.reduce((acc, commit) => {
      const hour = parseISO(commit.commit.author.date).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      x: hour,
      y: hourlyCommits[hour] || 0,
    }));

    return { dailyData, hourlyData };
  }, [commits]);

  const dailyChartData = {
    datasets: [
      {
        label: 'Commits per Day',
        data: dailyData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Commits by Hour',
        data: hourlyData.map(d => d.y),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
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
        ticks: {
          color: 'rgb(156, 163, 175)',
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

  const dailyOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        ...chartOptions.scales.x,
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d',
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-blue-400\" size={20} />
            <h3 className="text-lg font-medium text-white">Commits Timeline</h3>
          </div>
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-green-400" size={20} />
            <h3 className="text-lg font-medium text-white">Commits by Hour</h3>
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
          <TrendingUp className="text-blue-400" size={20} />
          <h3 className="text-lg font-medium text-white">Commits Timeline</h3>
        </div>
        <div className="h-64">
          <Line data={dailyChartData|| []} options={dailyOptions} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-green-400" size={20} />
          <h3 className="text-lg font-medium text-white">Commits by Hour of Day</h3>
        </div>
        <div className="h-64">
          <Bar data={hourlyChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}