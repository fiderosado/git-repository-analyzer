import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Commit } from '../types/git';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay } from 'date-fns';

interface ActivityHeatmapProps {
  commits: Commit[];
  loading: boolean;
}

export default function ActivityHeatmap({ commits, loading }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!commits.length) return [];

    // Get date range
    const dates = commits.map(c => parseISO(c.commit.author.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Count commits per day
    const commitsByDay = commits.reduce((acc, commit) => {
      const date = format(parseISO(commit.commit.author.date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate weeks
    const weeks = [];
    let currentWeekStart = startOfWeek(minDate, { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(maxDate, { weekStartsOn: 0 });

    while (currentWeekStart <= lastWeekEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
      const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
      
      const week = daysInWeek.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const commits = commitsByDay[dateStr] || 0;
        return {
          date: dateStr,
          commits,
          day: getDay(day),
        };
      });

      weeks.push(week);
      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return weeks;
  }, [commits]);

  const getIntensityClass = (commits: number) => {
    if (commits === 0) return 'bg-gray-700';
    if (commits <= 2) return 'bg-green-900';
    if (commits <= 5) return 'bg-green-700';
    if (commits <= 10) return 'bg-green-500';
    return 'bg-green-300';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="text-green-400\" size={20} />
          <h3 className="text-lg font-medium text-white">Activity Heatmap</h3>
        </div>
        <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="text-green-400" size={20} />
        <h3 className="text-lg font-medium text-white">Activity Heatmap</h3>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1 mb-2">
          <div className="w-8"></div>
          {heatmapData.slice(0, 53).map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(day.commits)} border border-gray-600`}
                  title={`${day.date}: ${day.commits} commits`}
                />
              ))}
            </div>
          ))}
        </div>
        
        <div className="flex gap-1">
          <div className="w-8 flex flex-col gap-1 text-xs text-gray-400">
            {dayLabels.map((label, index) => (
              <div key={index} className="h-3 flex items-center">
                {index % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-700 border border-gray-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900 border border-gray-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700 border border-gray-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500 border border-gray-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300 border border-gray-600"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}