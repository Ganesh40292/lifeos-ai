import { useState, useEffect } from 'react';
import { Flame, Plus, Trash2, Check, RefreshCw, Circle, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import habitService from '@/services/habitService';
import { useAuth } from '@/hooks/useAuth';

const HabitTrackerWidget = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { refreshUser } = useAuth();

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await habitService.getHabits();
      if (res.success) {
        setHabits(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (id) => {
    try {
      // Optimistic update
      setHabits(prev =>
        prev.map(h => {
          if (h.id === id) {
            const nextCompleted = !h.completedToday;
            return {
              ...h,
              completedToday: nextCompleted,
              streakDays: nextCompleted ? h.streakDays + 1 : Math.max(0, h.streakDays - 1),
            };
          }
          return h;
        })
      );

      const res = await habitService.toggleHabit(id);
      if (res.success) {
        setHabits(prev =>
          prev.map(h => (h.id === id ? res.data : h))
        );
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      // Revert if error
      fetchHabits();
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const res = await habitService.addHabit({
        name: newHabitName,
        description: newHabitDesc,
      });
      if (res.success) {
        setHabits(prev => [res.data, ...prev]);
        setNewHabitName('');
        setNewHabitDesc('');
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      const res = await habitService.deleteHabit(id);
      if (res.success) {
        setHabits(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  // Calculations
  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card
      title="Daily Habits"
      action={
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      }
    >
      <div className="space-y-4">
        {/* Completion ring / progress status */}
        {totalCount > 0 && (
          <div className="flex items-center gap-4 bg-bg-elevated p-3 rounded-xl border border-border/80">
            {/* SVG Progress Circle */}
            <div className="relative w-11 h-11 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-border-light fill-transparent"
                  strokeWidth="3.5"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-primary fill-transparent transition-all duration-500 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-secondary font-mono">
                {completionPercentage}%
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-text">Daily Completion</p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {completedCount} of {totalCount} habits finished today
              </p>
            </div>
          </div>
        )}

        {/* Add Habit Form inline */}
        {showForm && (
          <form onSubmit={handleAddHabit} className="p-3 bg-bg border border-border rounded-xl space-y-3">
            <Input
              label="Habit Name"
              placeholder="e.g. Read 15 pages, Drink Water"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              size="sm"
              required
            />
            <Input
              label="Description (Optional)"
              placeholder="e.g. 3 times daily, morning routine"
              value={newHabitDesc}
              onChange={(e) => setNewHabitDesc(e.target.value)}
              size="sm"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="xs" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="xs">
                Save Habit
              </Button>
            </div>
          </form>
        )}

        {/* Habit items list */}
        {loading ? (
          <div className="flex items-center justify-center py-6 text-text-faint text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading habits...
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-8 text-text-faint text-xs">
            No habits configured yet. Create one above to build routine streaks!
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="group flex items-center justify-between p-3 rounded-xl border border-border bg-bg-elevated/40 hover:bg-bg-elevated transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className="flex-shrink-0 cursor-pointer text-text-muted hover:text-primary transition-colors"
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${habit.completedToday ? 'line-through text-text-muted' : 'text-text'}`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-[10px] text-text-faint truncate mt-0.5">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Streak Flame */}
                  {habit.streakDays > 0 && (
                    <div className="flex items-center gap-0.5 text-amber-500 font-mono text-[10px] font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{habit.streakDays}d</span>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-faint hover:text-danger hover:bg-danger/10 rounded-md transition-all cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default HabitTrackerWidget;
