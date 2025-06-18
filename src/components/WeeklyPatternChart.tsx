import React, { useMemo, useState } from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import { Clock, Calendar, ChevronDown } from 'lucide-react';
import { Commit } from '@/types/git';
import { parseISO, getDay, format, getYear, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

interface WeeklyPatternChartProps {
  commits: Commit[];
  loading: boolean;
}

export default function WeeklyPatternChart({ commits, loading }: WeeklyPatternChartProps) {
  const availableYears = useMemo(() => {
    if (!commits.length) return [];
    const years = commits.map(commit => getYear(parseISO(commit.commit.author.date)));
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    return uniqueYears;
  }, [commits]);

  const [startYear, setStartYear] = useState(() => {
    return availableYears.length > 0 ? Math.min(...availableYears) : new Date().getFullYear();
  });

  const [endYear, setEndYear] = useState(() => {
    return availableYears.length > 0 ? Math.max(...availableYears) : new Date().getFullYear();
  });

  const { weeklyData, monthlyData } = useMemo(() => {
    if (!commits.length) return { weeklyData: [], monthlyData: [] };

    // Weekly pattern (day of week)
    const weeklyCommits = commits.reduce((acc, commit) => {
      const dayOfWeek = getDay(parseISO(commit.commit.author.date));
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = dayNames.map((_, index) => weeklyCommits[index] || 0);

    // Monthly pattern with year range
    const filteredCommits = commits.filter(commit => {
      const year = getYear(parseISO(commit.commit.author.date));
      return year >= startYear && year <= endYear;
    });

    // Generate all months in the selected range
    const startDate = startOfYear(new Date(startYear, 0, 1));
    const endDate = endOfYear(new Date(endYear, 0, 1));
    const allMonths = eachMonthOfInterval({ start: startDate, end: endDate });

    // Count commits per month
    const monthlyCommits = filteredCommits.reduce((acc, commit) => {
      const month = format(parseISO(commit.commit.author.date), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Create data for all months (including those with 0 commits)
    const monthlyData = allMonths.map(month => {
      const monthKey = format(month, 'MMM yyyy');
      return [monthKey, monthlyCommits[monthKey] || 0] as [string, number];
    });

    return { weeklyData, monthlyData };
  }, [commits, startYear, endYear]);

  const radarData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [{
      label: 'Commits by Day of Week',
      data: weeklyData,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)',
    }]
  };

  const monthlyBarData = {
    labels: monthlyData.map(([month]) => month),
    datasets: [{
      label: 'Commits per Month',
      data: monthlyData.map(([, count]) => count),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
    }]
  };

  const radarOptions = {
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
      r: {
        angleLines: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        pointLabels: {
          color: 'rgb(156, 163, 175)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          backdropColor: 'transparent',
        },
      },
    },
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
            <Clock className="text-blue-400" size={20} />
            <h3 className="text-lg font-medium text-white">Weekly Activity Pattern</h3>
          </div>
          <div className="h-64 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-green-400" size={20} />
            <h3 className="text-lg font-medium text-white">Monthly Activity Trends</h3>
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
          <Clock className="text-blue-400" size={20} />
          <h3 className="text-lg font-medium text-white">Weekly Activity Pattern</h3>
        </div>
        <div className="h-64">
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-400" size={20} />
            <h3 className="text-lg font-medium text-white">Monthly Activity Trends</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">From:</label>
              <div className="relative">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1.5 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">To:</label>
              <div className="relative">
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                >
                  {availableYears.filter(year => year >= startYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1.5 text-gray-400 pointer-events-none" size={12} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-64">
          <Bar data={monthlyBarData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}