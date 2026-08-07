/**
 * Report Card Component
 * Displays individual citizen report
 */

import React from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users, AlertCircle } from 'lucide-react';

const ReportCard = ({ report }) => {
  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500',
    };
    return colors[urgency] || 'text-gray-500';
  };

  const getUrgencyBg = (urgency) => {
    const colors = {
      low: 'bg-gray-100',
      medium: 'bg-yellow-100',
      high: 'bg-orange-100',
      critical: 'bg-red-100',
    };
    return colors[urgency] || 'bg-gray-100';
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-serif text-bodhi-navy">{report.title}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`badge ${getUrgencyBg(report.urgency)} ${getUrgencyColor(report.urgency)}`}>
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {report.urgency.toUpperCase()}
            </span>
            <span className="badge badge-officer">{report.category}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" /> {report.district}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {format(new Date(report.createdAt), 'MMM d, yyyy')}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{report.description}</p>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
        {report.affectedPeople && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {report.affectedPeople} people affected
          </span>
        )}
        {report.affectedChildren && (
          <span className="flex items-center gap-1">
            👶 {report.affectedChildren} children
          </span>
        )}
        {report.affectedWomen && (
          <span className="flex items-center gap-1">
            👩 {report.affectedWomen} women
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {report.status}
        </span>
      </div>

      {report.images && report.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {report.images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.caption || 'Report image'}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
          ))}
          {report.images.length > 3 && (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
              +{report.images.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;