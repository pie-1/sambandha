/**
 * Report Heatmap Component
 * Visualizes problem reports by district
 */

import React from 'react';
import { useReports } from '../../hooks/useReports';
import LoadingSpinner from '../common/LoadingSpinner';

const ReportHeatmap = () => {
  const { stats, statsLoading, topDistricts } = useReports();

  if (statsLoading) return <LoadingSpinner size="sm" />;

  const getUrgencyColor = (count) => {
    if (count >= 5) return 'bg-red-500';
    if (count >= 3) return 'bg-orange-500';
    if (count >= 1) return 'bg-yellow-500';
    return 'bg-gray-200';
  };

  const getUrgencyText = (count) => {
    if (count >= 5) return 'Critical';
    if (count >= 3) return 'High';
    if (count >= 1) return 'Medium';
    return 'Low';
  };

  return (
    <div className="card">
      <h3 className="font-serif text-lg text-bodhi-navy mb-4">📍 Problem Heatmap</h3>
      
      {topDistricts && topDistricts.length > 0 ? (
        <div className="space-y-3">
          {topDistricts.slice(0, 10).map((district, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-bodhi-navy truncate">
                {district._id}
              </div>
              <div className="flex-1">
                <div className={`h-6 rounded-lg ${getUrgencyColor(district.count)} transition-all duration-500`} />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold">{district.count}</span>
                <span className="text-gray-400">reports</span>
                <span className={`px-2 py-0.5 rounded-full text-white text-xs ${getUrgencyColor(district.count)}`}>
                  {getUrgencyText(district.count)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No reports yet</p>
          <p className="text-xs text-gray-400">Reports will appear here once citizens submit them</p>
        </div>
      )}
    </div>
  );
};

export default ReportHeatmap;