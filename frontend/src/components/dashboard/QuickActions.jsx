import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, CreditCard, Clock, Target, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import PomodoroTimer from './PomodoroTimer';
import { useAuth } from '@/hooks/useAuth';

/**
 * Section 5: Quick Actions grid allowing the user to trigger interactive forms.
 */
const QuickActions = () => {
  const { refreshUser } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'note' | 'expense' | 'goal' | 'timer' | null

  // Pomodoro Study Timer States
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(1500);
  };

  const handleActionClick = (type) => {
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    alert('Action logged successfully (Dummy action simulated)');
    handleCloseModal();
  };

  const actions = [
    {
      id: 'note',
      title: 'Add Note',
      description: 'Quickly draft ideas or scratchpad notes',
      icon: Plus,
      color: 'text-accent',
      bgColor: 'bg-accent-muted border-accent/20 hover:border-accent/40',
    },
    {
      id: 'expense',
      title: 'Add Expense',
      description: 'Log textbooks, canteen or commute payments',
      icon: CreditCard,
      color: 'text-success',
      bgColor: 'bg-success-muted border-success/20 hover:border-success/40',
    },
    {
      id: 'timer',
      title: 'Study Timer',
      description: 'Start focus countdown timer (Pomodoro)',
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info-muted border-info/20 hover:border-info/40',
    },
    {
      id: 'goal',
      title: 'Create Goal',
      description: 'Set milestones for academic or personal targets',
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning-muted border-warning/20 hover:border-warning/40',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleActionClick(act.id)}
              className={clsx(
                'flex flex-col items-start text-left p-5 rounded-xl border',
                'bg-bg-card shadow-sm cursor-pointer transition-all duration-300',
                'hover:shadow-md hover:-translate-y-1 hover:bg-bg-hover group',
                act.bgColor
              )}
            >
              <div className={clsx('p-3 rounded-lg mb-4 transition-transform duration-300 group-hover:scale-115', act.bgColor, act.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text group-hover:text-primary-light transition-colors mb-1">
                {act.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {act.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* --- MOCK INTERACTIVE MODALS --- */}

      {/* 1. Add Note Modal */}
      <Modal isOpen={activeModal === 'note'} onClose={handleCloseModal} title="Create Quick Note">
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <Input label="Note Title" placeholder="e.g. Project brainstorm ideas" required />
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Content
            </label>
            <textarea
              rows={4}
              placeholder="Start typing your note contents..."
              className="w-full bg-bg-input border border-border rounded-lg p-3 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="accent" type="submit">Create Note</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Expense Modal */}
      <Modal isOpen={activeModal === 'expense'} onClose={handleCloseModal} title="Log Daily Expense">
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <Input label="Amount (₹)" type="number" placeholder="e.g. 450" required />
          <Input label="Description / Payee" placeholder="e.g. DSA Reference Textbook" required />
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Category
            </label>
            <select className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Education / Books</option>
              <option>Food & Drinks</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Others</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="success" type="submit">Log Expense</Button>
          </div>
        </form>
      </Modal>

      {/* 3. Create Goal Modal */}
      <Modal isOpen={activeModal === 'goal'} onClose={handleCloseModal} title="Create New Goal">
        <form onSubmit={handleMockSubmit} className="space-y-4">
          <Input label="Goal Title" placeholder="e.g. Solve 200 DSA Problems" required />
          <Input label="Target Metric" placeholder="e.g. 100% or 70kg" required />
          <Input label="Target Deadline" type="date" required />
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Focus Theme
            </label>
            <select className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Primary (Blue)</option>
              <option>Accent (Purple)</option>
              <option>Success (Green)</option>
              <option>Warning (Yellow)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="warning" type="submit">Set Goal</Button>
          </div>
        </form>
      </Modal>

      {/* 4. Pomodoro Timer Modal */}
      <Modal isOpen={activeModal === 'timer'} onClose={handleCloseModal} title="Focus Study Timer" size="sm">
        <PomodoroTimer onSessionComplete={() => {
          refreshUser();
        }} />
      </Modal>
    </>
  );
};

export default QuickActions;
