/**
 * Draft Upload Page - Create New Policy
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDrafts } from '../../hooks/useDrafts';

const DraftUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createDraft } = useDrafts();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    sector: 'health',
    subCategory: 'healthcare_access',
    currentVersionText: '',
    district: 'Kathmandu',
    municipality: '',
    description: '',
    budgetAmount: '',
    expectedImpact: {
      healthImpact: '',
      environmentalImpact: '',
      communityImpact: '',
    },
  });

  const sectors = [
    { value: 'health', label: 'Health' },
    { value: 'environment', label: 'Environment' },
    { value: 'one_health', label: 'One Health' },
  ];

  const subCategories = [
    'maternal_health', 'child_nutrition', 'water_quality',
    'air_quality', 'disease_prevention', 'sanitation',
    'climate_health', 'zoonotic_diseases', 'healthcare_access'
  ];

  const districts = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal',
    'Biratnagar', 'Birgunj', 'Dharan', 'Janakpur', 'Hetauda',
    'Dhangadhi', 'Nepalgunj', 'Gorkha', 'Chitwan', 'Kaski',
    'Humla', 'Banke', 'Bajhang', 'Karnali', 'Khatyad'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
    };

    const result = await createDraft.mutateAsync(data);
    if (result) {
      navigate(`/drafts/${result._id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bodhi-navy">Create Policy Draft</h1>
        <p className="text-gray-600 text-sm mt-1">Collaborate with experts and citizens on One Health policies</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title *</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Humla Maternity Care Emergency Plan"
              required
            />
          </div>

          {/* Sector & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              >
                {sectors.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              >
                {subCategories.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                placeholder="Municipality name"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the policy"
            />
          </div>

          {/* Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount (NPR)</label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
              value={formData.budgetAmount}
              onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
              placeholder="Enter budget amount"
              min="0"
            />
          </div>

          {/* Policy Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Content *</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass min-h-[150px]"
              value={formData.currentVersionText}
              onChange={(e) => setFormData({ ...formData, currentVersionText: e.target.value })}
              placeholder="Write the full policy draft here..."
              required
            />
          </div>

          {/* Expected Impact */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Impact</label>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Health Impact</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                  value={formData.expectedImpact.healthImpact}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedImpact: { ...formData.expectedImpact, healthImpact: e.target.value }
                  })}
                  placeholder="e.g., Reduce maternal mortality by 50%"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Environmental Impact</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                  value={formData.expectedImpact.environmentalImpact}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedImpact: { ...formData.expectedImpact, environmentalImpact: e.target.value }
                  })}
                  placeholder="e.g., Clean water for 5000 people"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Community Impact</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sambandh-brass"
                  value={formData.expectedImpact.communityImpact}
                  onChange={(e) => setFormData({
                    ...formData,
                    expectedImpact: { ...formData.expectedImpact, communityImpact: e.target.value }
                  })}
                  placeholder="e.g., 20 trained health workers"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm font-medium text-bodhi-navy">Collaboration Ready</p>
            <p className="text-xs text-gray-500">Experts and citizens will review this draft</p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-bodhi-navy text-white rounded-lg font-semibold hover:bg-bodhi-navy-deep transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Policy Draft'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DraftUpload;