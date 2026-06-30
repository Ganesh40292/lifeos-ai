import { useState } from 'react';
import { Plus, Activity, Edit, Trash2, Calendar, Clock, Flame } from 'lucide-react';
import WorkoutModal from './WorkoutModal';
import { healthService } from '@/services/healthService';

const WorkoutLog = ({ workouts, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingWorkout(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await healthService.deleteWorkout(id);
        onRefresh();
      } catch (err) {
        console.error('Failed to delete workout:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-medium text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-emerald-500" />
          Recent Workouts
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Log Workout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {workouts && workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map(workout => (
              <div 
                key={workout.id} 
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white flex items-center">
                    {workout.type}
                  </h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(workout)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(workout.id)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 shrink-0" />
                    <span>{workout.durationMinutes} mins</span>
                  </div>
                  {workout.caloriesBurned && (
                    <div className="flex items-center text-orange-400">
                      <Flame className="w-4 h-4 mr-1.5 shrink-0" />
                      <span>{workout.caloriesBurned} kcal</span>
                    </div>
                  )}
                </div>

                {workout.notes && (
                  <p className="mt-3 text-sm text-gray-300 bg-gray-900/50 p-2 rounded-md border border-gray-700/50">
                    {workout.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
            <Activity className="w-12 h-12 mb-3 text-gray-700" />
            <p>No workouts logged yet</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <WorkoutModal
          workout={editingWorkout}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default WorkoutLog;
