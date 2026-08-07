/**
 * STEP 6: Implementation Tracking
 * Track policy progress, budget, and impact
 */

import React, { useState } from 'react';
import { useDrafts } from '../../hooks/useDrafts';
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Target, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const ImplementationTracker = ({ implementation, draftId, isOfficer }) => {
  const { updateImplementation } = useDrafts();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: implementation?.status || 'pending',
    progress: implementation?.progress || 0,
    budgetSpent: implementation?.budgetSpent || 0,
    impactScore: implementation?.impactScore || 0,
    notes: implementation?.notes || '',
  });

  if (!implementation) return null;

  const { status, progress, startDate, completionDate, budgetAllocated, budgetSpent, impactScore, notes } = implementation;

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-gray-500',
      in_progress: 'text-yellow-500',
      completed: 'text-green-500',
      stalled: 'text-red-500',
    };
    return colors[status] || 'text-gray-500';
  };

  const getStatusBg = (status) => {
    const colors = {
      pending: 'bg-gray-100',
      in_progress: 'bg-yellow-100',
      completed: 'bg-green-100',
      stalled: 'bg-red-100',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      in_progress: <TrendingUp className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      stalled: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getBudgetUtilization = () => {
    if (!budgetAllocated || budgetAllocated === 0) return 0;
    return (budgetSpent / budgetAllocated) * 100;
  };

  const handleUpdate = async () => {
    try {
      await updateImplementation.mutateAsync({
        id: draftId,
        ...formData,
      });
      setIsEditing(false);
      toast.success('✅ Implementation updated!');
    } catch (error) {
      toast.error('❌ Failed to update');
    }
  };

  return (
    <div className="card border-l-4 border-sdg-blue">
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-5 h-5 text-sdg-blue" />
        <h3 className="font-semibold text-sdg-blue">Implementation Tracking</h3>
        <span className="text-xs bg-sdg-blue/10 text-sdg-blue px-2 py-0.5 rounded-full">STEP 6</span>
        {isOfficer && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-sm px-3 py-1 ml-auto"
          >
            Update
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="stalled">Stalled</option>
              </select>
            </div>
            <div>
              <label className="label">Progress (%)</label>
              <input
                type="number"
                className="input-field"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Budget Spent (Rs)</label>
              <input
                type="number"
                className="input-field"
                value={formData.budgetSpent}
                onChange={(e) => setFormData({ ...formData, budgetSpent: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="label">Impact Score (1-10)</label>
              <input
                type="number"
                className="input-field"
                value={formData.impactScore}
                onChange={(e) => setFormData({ ...formData, impactScore: parseInt(e.target.value) || 0 })}
                min="0"
                max="10"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              placeholder="Add implementation notes..."
            />
          </div>

          <div className="flex gap-2">
            <button onClick={handleUpdate} className="btn-primary">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBg(status)}`}>
              {getStatusIcon(status)}
              <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                {status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {progress}% Complete
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress >= 80 ? 'bg-green-500' :
                progress >= 40 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Budget Allocated</p>
              <p className="text-lg font-bold text-sdg-blue">
                {budgetAllocated ? `NPR ${budgetAllocated.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Budget Spent</p>
              <p className="text-lg font-bold text-sdg-blue">
                {budgetSpent ? `NPR ${budgetSpent.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Utilization</p>
              <p className="text-lg font-bold text-sdg-blue">
                {getBudgetUtilization().toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Impact Score</p>
              <p className="text-lg font-bold text-sdg-blue">
                {impactScore || 'N/A'} / 10
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Started: {new Date(startDate).toLocaleDateString()}</span>
              </div>
            )}
            {completionDate && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Completed: {new Date(completionDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">📝 {notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImplementationTracker;