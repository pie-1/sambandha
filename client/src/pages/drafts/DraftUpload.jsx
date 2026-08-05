/**
 * Draft Upload Page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../../hooks/useDrafts';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const DraftUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createDraft } = useDrafts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sector: 'development',
    currentVersionText: '',
    district: 'Kathmandu',
    description: '',
    budgetAmount: '',
  });

  const sectors = [
    'budget', 'development', 'agriculture', 'education',
    'health', 'infrastructure', 'tourism', 'other'
  ];

  const districts = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal',
    'Biratnagar', 'Birgunj', 'Dharan', 'Janakpur', 'Hetauda',
    'Dhangadhi', 'Nepalgunj', 'Gorkha', 'Chitwan', 'Kaski'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
    };

    const result = await createDraft.mutateAsync(data);
    setLoading(false);

    if (result) {
      toast.success('Draft created successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif text-bodhi-navy mb-6">Upload New Draft</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">Sector</label>
              <select
                name="sector"
                className="input-field"
                value={formData.sector}
                onChange={handleChange}
                required
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="label">District</label>
              <select
                name="district"
                className="input-field"
                value={formData.district}
                onChange={handleChange}
                required
              >
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Description</label>
            <input
              type="text"
              name="description"
              className="input-field"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the policy"
            />
          </div>

          <div className="mb-4">
            <label className="label">Budget Amount (NPR)</label>
            <input
              type="number"
              name="budgetAmount"
              className="input-field"
              value={formData.budgetAmount}
              onChange={handleChange}
              placeholder="Enter budget amount"
            />
          </div>

          <div className="mb-6">
            <label className="label">Draft Content</label>
            <textarea
              name="currentVersionText"
              className="input-field min-h-[300px]"
              value={formData.currentVersionText}
              onChange={handleChange}
              required
              placeholder="Write your policy draft here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Draft'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DraftUpload;