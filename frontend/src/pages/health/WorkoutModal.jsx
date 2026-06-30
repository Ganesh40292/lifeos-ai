import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { healthService } from '@/services/healthService';

const WORKOUT_TYPES = [
  'Running', 'Walking', 'Cycling', 'Swimming', 
  'Weightlifting', 'Yoga', 'HIIT', 'Sports', 'Other'
];

const WorkoutModal = ({ workout, isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    type: 'Running',
    durationMinutes: '',
    caloriesBurned: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workout) {
      setFormData({
        type: workout.type || 'Running',
        durationMinutes: workout.durationMinutes || '',
        caloriesBurned: workout.caloriesBurned || '',
        date: workout.date || new Date().toISOString().split('T')[0],
        notes: workout.notes || ''
      });
    } else {
      setFormData({
        type: 'Running',
        durationMinutes: '',
        caloriesBurned: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [workout]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        durationMinutes: parseInt(formData.durationMinutes, 10),
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned, 10) : null
      };

      if (workout && workout.id) {
        await healthService.updateWorkout(workout.id, payload);
      } else {
        await healthService.createWorkout(payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to save workout:', err);
      setError(err.response?.data?.message || 'Failed to save workout. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-800 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {workout ? 'Edit Workout' : 'Log Workout'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form id="workout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Workout Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WORKOUT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Duration (mins) *</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 45"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Calories Burned</label>
                <input
                  type="number"
                  name="caloriesBurned"
                  value={formData.caloriesBurned}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="How did it feel?"
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-gray-800 bg-gray-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="workout-form"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-spin border-2 border-white/20 border-t-white w-4 h-4 rounded-full mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {workout ? 'Save Changes' : 'Log Workout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
