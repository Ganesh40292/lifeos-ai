import { useState, useEffect } from 'react';
import { Save, Droplet, Moon, Scale } from 'lucide-react';
import { healthService } from '@/services/healthService';

const MetricsPanel = ({ metrics, onRefresh }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    date: todayStr,
    weight: '',
    waterIntakeGlasses: '',
    sleepHours: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'

  // When metrics load, try to find today's entry
  useEffect(() => {
    if (metrics && metrics.length > 0) {
      const todayMetric = metrics.find(m => m.date === todayStr);
      if (todayMetric) {
        setFormData({
          date: todayStr,
          weight: todayMetric.weight || '',
          waterIntakeGlasses: todayMetric.waterIntakeGlasses || '',
          sleepHours: todayMetric.sleepHours || ''
        });
      }
    }
  }, [metrics, todayStr]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveStatus(null);

    try {
      await healthService.saveMetric({
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        waterIntakeGlasses: formData.waterIntakeGlasses ? parseInt(formData.waterIntakeGlasses, 10) : null,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null
      });
      setSaveStatus('success');
      onRefresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save metrics:', err);
      setSaveStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">Daily Tracking</h2>
        <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
          {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Weight */}
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6 text-blue-500/30" />
            </div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-3 relative z-10">
              <Scale className="w-4 h-4 mr-2 text-blue-400" />
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg relative z-10"
              placeholder="e.g. 70.5"
            />
          </div>

          {/* Water */}
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6 text-cyan-500/30" />
            </div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-3 relative z-10">
              <Droplet className="w-4 h-4 mr-2 text-cyan-400" />
              Water (Glasses)
            </label>
            <div className="flex items-center space-x-3 relative z-10">
              <input
                type="range"
                min="0"
                max="15"
                name="waterIntakeGlasses"
                value={formData.waterIntakeGlasses || 0}
                onChange={handleChange}
                className="flex-1 accent-cyan-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xl font-bold text-white min-w-[2rem] text-center">
                {formData.waterIntakeGlasses || 0}
              </span>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Moon className="w-6 h-6 text-purple-500/30" />
            </div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-3 relative z-10">
              <Moon className="w-4 h-4 mr-2 text-purple-400" />
              Sleep (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              name="sleepHours"
              value={formData.sleepHours}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-lg relative z-10"
              placeholder="e.g. 7.5"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm">
            {saveStatus === 'success' && (
              <span className="text-emerald-400 font-medium animate-pulse">✓ Metrics saved for today!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400 font-medium">Failed to save metrics.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Today's Log
          </button>
        </div>
      </form>
    </div>
  );
};

export default MetricsPanel;
