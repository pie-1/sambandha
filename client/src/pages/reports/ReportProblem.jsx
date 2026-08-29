import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useReports } from '../../hooks/useReports';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertTriangle, Camera, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { createReport } = useReports();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maternal_health',
    district: 'Kathmandu',
    municipality: '',
    ward: '',
    urgency: 'medium',
    affectedPeople: '',
    affectedChildren: '',
    affectedWomen: '',
  });

  const districts = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal',
    'Biratnagar', 'Birgunj', 'Dharan', 'Janakpur', 'Hetauda',
    'Dhangadhi', 'Nepalgunj', 'Gorkha', 'Chitwan', 'Kaski',
    'Humla', 'Banke', 'Bajhang', 'Karnali', 'Khatyad'
  ];

  const categories = [
    { value: 'maternal_health', label: '🤰 Maternal Health', icon: '🤰' },
    { value: 'child_nutrition', label: '🍼 Child Nutrition', icon: '🍼' },
    { value: 'water_quality', label: '💧 Water Quality', icon: '💧' },
    { value: 'air_quality', label: '🌬️ Air Quality', icon: '🌬️' },
    { value: 'disease_prevention', label: '💉 Disease Prevention', icon: '💉' },
    { value: 'healthcare_access', label: '🏥 Healthcare Access', icon: '🏥' },
    { value: 'zoonotic_diseases', label: '🐾 Zoonotic Diseases', icon: '🐾' },
    { value: 'climate_health', label: '🌍 Climate Health', icon: '🌍' },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageData = images.map((file) => ({
      url: URL.createObjectURL(file),
      caption: file.name,
    }));

    const data = {
      ...formData,
      affectedPeople: formData.affectedPeople ? parseInt(formData.affectedPeople) : undefined,
      affectedChildren: formData.affectedChildren ? parseInt(formData.affectedChildren) : undefined,
      affectedWomen: formData.affectedWomen ? parseInt(formData.affectedWomen) : undefined,
      images: imageData,
    };

    const result = await createReport.mutateAsync(data);
    if (result) {
      toast.success('Report submitted! Your voice matters.');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-sdg-gold text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span>
          <span className="font-bold text-sdg-blue">Public Data Collection</span>
        </div>
        <div className="h-px flex-1 bg-gray-200"></div>
        <span className="text-xs text-gray-400">Citizen Reporting</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-sdg-blue">📢 Report a Problem</h1>
        <p className="text-gray-600 mt-2">
          Help identify health and environmental issues in your community
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="label">Problem Title *</label>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's the problem?"
              required
            />
          </div>          
          <div className="mb-4">
            <label className="label">Description *</label>
            <textarea
              className="input-field min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem in detail..."
              required
            />
          </div>          
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">Category *</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="label">Urgency *</label>
              <select
                className="input-field"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">District *</label>
              <select
                className="input-field"
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
              <label className="label">Municipality</label>
              <input
                type="text"
                className="input-field"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                placeholder="Municipality name"
              />
            </div>
          </div>          
          <div className="grid grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="label">People Affected</label>
              <input
                type="number"
                className="input-field"
                value={formData.affectedPeople}
                onChange={(e) => setFormData({ ...formData, affectedPeople: e.target.value })}
                placeholder="Total"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="label">Children</label>
              <input
                type="number"
                className="input-field"
                value={formData.affectedChildren}
                onChange={(e) => setFormData({ ...formData, affectedChildren: e.target.value })}
                placeholder="Children"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="label">Women</label>
              <input
                type="number"
                className="input-field"
                value={formData.affectedWomen}
                onChange={(e) => setFormData({ ...formData, affectedWomen: e.target.value })}
                placeholder="Women"
                min="0"
              />
            </div>
          </div>          
          <div className="mb-6">
            <label className="label">Upload Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-sdg-gold transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400">Max 5 images</p>
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Submitting...' : '📢 Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportProblem;