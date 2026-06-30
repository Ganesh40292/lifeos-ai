import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  BookMarked,
  Award,
  Download,
  Printer,
} from 'lucide-react';
import { exportUtils } from '@/utils/exportUtils';
import clsx from 'clsx';

// Services & Components
import studentService from '@/services/studentService';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import StudyScheduler from '@/components/student/StudyScheduler';

// Timetable weekdays tabs list
const TIMETABLE_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const WEEKDAY_SHORT = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const StudentPage = () => {
  const { refreshUser } = useAuth();
  // Page states
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [analytics, setAnalytics] = useState({
    cgpa: 0,
    overallAttendance: 100,
    assignmentCompletionRate: 100,
    totalCredits: 0,
    studyMinutes: 0,
    lowAttendanceAlerts: []
  });
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [activeModal, setActiveModal] = useState(null); // 'subject' | 'assignment' | 'timetable' | null
  const [activeDayTab, setActiveDayTab] = useState('MONDAY');

  // Input form states
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', credits: 3 });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', subjectId: '', dueDate: '', priority: 'MEDIUM' });
  const [timetableForm, setTimetableForm] = useState({ subjectId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '' });

  // Load dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, assignRes, timeRes, analyticsRes] = await Promise.all([
        studentService.getSubjects(),
        studentService.getAssignments(),
        studentService.getTimetable(),
        studentService.getAnalytics(),
      ]);
      setSubjects(subsRes.data || []);
      setAssignments(assignRes.data || []);
      setTimetable(timeRes.data || []);
      setAnalytics(analyticsRes.data || {
        cgpa: 0,
        overallAttendance: 100,
        assignmentCompletionRate: 100,
        totalCredits: 0,
        studyMinutes: 0,
        lowAttendanceAlerts: []
      });
    } catch (err) {
      console.error('Error fetching academic data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const res = await studentService.getAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Error refreshing academic analytics:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Attendance Increment Handler ---
  const handleAttendance = async (subjectId, attended) => {
    try {
      const res = await studentService.updateAttendance(subjectId, attended);
      if (res.success) {
        setSubjects((prev) =>
          prev.map((sub) => (sub.id === subjectId ? res.data : sub))
        );
        refreshAnalytics();
      }
    } catch (err) {
      console.error('Error logging attendance:', err);
    }
  };

  // --- Subject Submit Handler ---
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await studentService.addSubject(subjectForm);
      if (res.success) {
        setSubjects((prev) => [...prev, res.data]);
        setSubjectForm({ name: '', code: '', credits: 3 });
        setActiveModal(null);
        refreshAnalytics();
      }
    } catch (err) {
      console.error('Error creating subject:', err);
    }
  };

  // --- Subject Delete Handler ---
  const handleDeleteSubject = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject? All related timetable entries and assignments will be orphaned.')) {
      return;
    }
    try {
      const res = await studentService.deleteSubject(subjectId);
      if (res.success) {
        setSubjects((prev) => prev.filter((sub) => sub.id !== subjectId));
        // Reload in case assignments or timetable references changed on backend
        loadData();
      }
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  // --- Assignment Submit Handler ---
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...assignmentForm, status: 'TODO' };
      const res = await studentService.addAssignment(payload);
      if (res.success) {
        setAssignments((prev) => [...prev, res.data]);
        setAssignmentForm({ title: '', subjectId: '', dueDate: '', priority: 'MEDIUM' });
        setActiveModal(null);
        refreshAnalytics();
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
    }
  };

  // --- Assignment Status Switcher ---
  const handleAssignmentStatusChange = async (id, currentStatus) => {
    let nextStatus = 'TODO';
    if (currentStatus === 'TODO') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'SUBMITTED';
    else return; // Lock if already submitted/complete in version 1

    try {
      const res = await studentService.updateAssignmentStatus(id, nextStatus);
      if (res.success) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? res.data : a))
        );
        refreshUser();
        refreshAnalytics();
      }
    } catch (err) {
      console.error('Error updating assignment status:', err);
    }
  };

  // --- Timetable Submit Handler ---
  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await studentService.addTimetableEntry(timetableForm);
      if (res.success) {
        setTimetable((prev) => [...prev, res.data]);
        setTimetableForm({ subjectId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: '' });
        setActiveModal(null);
      }
    } catch (err) {
      console.error('Error scheduling class slot:', err);
    }
  };

  const handleExportCSV = () => {
    if (!assignments || assignments.length === 0) return;
    exportUtils.downloadCSV(
      assignments,
      ['Title', 'Due Date', 'Status', 'Priority'],
      ['title', 'dueDate', 'status', 'priority'],
      'assignments.csv'
    );
  };

  const handleExportPDF = () => {
    exportUtils.printToPDF('student-page-content', 'Academics Report');
  };

  // --- Stat Calculations ---
  const overallAttendance = () => {
    const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
    const totalHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    if (totalHeld === 0) return 100.0;
    return Math.round((totalAttended / totalHeld) * 1000) / 10;
  };

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);

  // Group timetable entries by weekday
  const getTimetableForDay = (day) => {
    return timetable
      .filter((entry) => entry.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Group assignments by status
  const getAssignmentsByStatus = (status) => {
    return assignments.filter((a) => a.status === status);
  };

  return (
    <motion.div
      id="student-page-content"
      className="page-container"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" variants={itemVariants}>
        <div>
          <h1 className="page-title">Academics</h1>
          <p className="page-subtitle">Track subjects, live attendance rates, timetables, and assignment sprints.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />} title="Export CSV">
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} icon={<Printer className="w-4 h-4" />} title="Export PDF">
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveModal('subject')} icon={<Plus className="w-4 h-4" />}>
            Add Subject
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveModal('timetable')} icon={<Calendar className="w-4 h-4" />}>
            Schedule Class
          </Button>
          <Button variant="accent" size="sm" onClick={() => setActiveModal('assignment')} icon={<Plus className="w-4 h-4" />}>
            Add Assignment
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton.Card className="md:col-span-1" />
          <Skeleton.Card className="md:col-span-1" />
          <Skeleton.Card className="md:col-span-1" />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hover className="flex items-center gap-4 p-5">
              <div className={clsx('p-3 rounded-lg', analytics.overallAttendance >= 75 ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger')}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-semibold">Attendance</p>
                <p className="text-2xl font-bold text-text mt-1">{analytics.overallAttendance}%</p>
                <p className="text-xs text-text-faint mt-0.5">Overall (Target: 75%)</p>
              </div>
            </Card>

            <Card hover className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-info-muted text-info">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-semibold">GPA Scale</p>
                <p className="text-2xl font-bold text-text mt-1">{analytics.cgpa} / 4.0</p>
                <p className="text-xs text-text-faint mt-0.5">Weighted CGPA</p>
              </div>
            </Card>

            <Card hover className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-primary-muted text-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-semibold">Task Rate</p>
                <p className="text-2xl font-bold text-text mt-1">{analytics.assignmentCompletionRate}%</p>
                <p className="text-xs text-text-faint mt-0.5">Completed assignments</p>
              </div>
            </Card>

            <Card hover className="flex items-center gap-4 p-5">
              <div className="p-3 rounded-lg bg-warning-muted text-warning">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider font-semibold">Study Time</p>
                <p className="text-2xl font-bold text-text mt-1">
                  {Math.round((analytics.studyMinutes / 60) * 10) / 10} Hrs
                </p>
                <p className="text-xs text-text-faint mt-0.5">Total focus logged</p>
              </div>
            </Card>
          </div>

          {/* Low Attendance Warnings Alert Box */}
          {analytics.lowAttendanceAlerts && analytics.lowAttendanceAlerts.length > 0 && (
            <div className="bg-danger-muted/10 border border-danger/25 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-danger uppercase tracking-wider">Attendance Deficit Warnings</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The following courses are currently below the required 75% attendance threshold. Attend next classes to prevent debarment:
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {analytics.lowAttendanceAlerts.map((alert) => (
                    <span key={alert.subjectId} className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-danger-muted/20 text-danger border border-danger/20 px-2 py-0.5 rounded-lg">
                      {alert.subjectCode}: {alert.attendancePercentage}% ({alert.attendedClasses}/{alert.totalClasses} classes)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Block: Subjects & Timetable Entries */}
            <div className="xl:col-span-7 space-y-6">
              {/* Subjects & Attendance Manager */}
              <Card title="Subjects & Attendance Tracker">
                {subjects.length === 0 ? (
                  <div className="text-center py-6 text-text-faint text-sm">
                    No registered courses yet. Click "Add Subject" to begin.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjects.map((sub) => {
                      const percent = sub.attendancePercentage;
                      const isLow = percent < 75;

                      return (
                        <div key={sub.id} className="p-4 rounded-xl bg-bg-elevated border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-text-muted px-2 py-0.5 bg-bg-hover rounded border border-border">
                                {sub.code}
                              </span>
                              <h4 className="text-sm font-semibold text-text">{sub.name}</h4>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-text-faint">
                              <span>{sub.credits} Credits</span>
                              <span>•</span>
                              <span>Attended: {sub.attendedClasses} / {sub.totalClasses} lectures</span>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="w-full flex items-center gap-3 pt-1">
                              <div className="h-1.5 flex-1 bg-bg-hover rounded-full overflow-hidden border border-border">
                                <div
                                  className={clsx('h-full transition-all duration-300', isLow ? 'bg-danger' : 'bg-success')}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className={clsx('text-xs font-mono font-bold', isLow ? 'text-danger' : 'text-success')}>
                                {percent}%
                              </span>
                            </div>
                          </div>

                          {/* Trigger Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold" onClick={() => handleAttendance(sub.id, true)}>
                              + Attended
                            </Button>
                            <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold" onClick={() => handleAttendance(sub.id, false)}>
                              + Absent
                            </Button>
                            <button
                              onClick={() => handleDeleteSubject(sub.id)}
                              className="p-2 rounded-lg text-text-faint hover:text-danger hover:bg-danger-muted transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Weekly Timetable Schedule */}
              <Card title="Weekly Timetable schedule">
                {/* Weekday Switcher Tabs */}
                <div className="flex flex-wrap gap-1 bg-bg-hover p-1 rounded-lg mb-4 border border-border">
                  {TIMETABLE_DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDayTab(day)}
                      className={clsx(
                        'flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer',
                        activeDayTab === day
                          ? 'bg-bg-card text-text shadow-sm border border-border'
                          : 'text-text-muted hover:text-text'
                      )}
                    >
                      {WEEKDAY_SHORT[day]}
                    </button>
                  ))}
                </div>

                {/* Day's Classes List */}
                <div className="space-y-2">
                  {getTimetableForDay(activeDayTab).length === 0 ? (
                    <div className="text-center py-6 text-text-faint text-xs">
                      No classes scheduled for {WEEKDAY_SHORT[activeDayTab]}day.
                    </div>
                  ) : (
                    getTimetableForDay(activeDayTab).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary-muted text-primary flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-text">{entry.subjectName}</h4>
                            <p className="text-xs text-text-faint font-medium font-mono mt-0.5">{entry.subjectCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-text-faint" />
                            {entry.startTime.substring(0, 5)} - {entry.endTime.substring(0, 5)}
                          </div>
                          <div className="flex items-center gap-1 bg-bg-hover border border-border px-2 py-0.5 rounded text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-text-faint" />
                            {entry.room}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Smart Study Scheduler */}
              <StudyScheduler />
            </div>

            {/* Right Block: Assignments Kanban Board */}
            <div className="xl:col-span-5 space-y-4">
              <Card title="Assignments Kanban Sprints">
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* TODO Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">To Do</span>
                      <Badge variant="primary" size="sm">{getAssignmentsByStatus('TODO').length}</Badge>
                    </div>
                    
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {getAssignmentsByStatus('TODO').length === 0 ? (
                        <p className="text-center text-text-faint text-xs py-4">No tasks pending</p>
                      ) : (
                        getAssignmentsByStatus('TODO').map((a) => (
                          <div
                            key={a.id}
                            onClick={() => handleAssignmentStatusChange(a.id, 'TODO')}
                            className="p-3 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border transition-all duration-200 cursor-pointer group flex flex-col gap-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors line-clamp-1">
                                {a.title}
                              </h5>
                              <ArrowRight className="w-3.5 h-3.5 text-text-faint group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-text-faint">
                              <span className="font-semibold text-primary">{a.subjectCode}</span>
                              <span>Due: {a.dueDate}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* IN PROGRESS Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">In Progress</span>
                      <Badge variant="warning" size="sm">{getAssignmentsByStatus('IN_PROGRESS').length}</Badge>
                    </div>
                    
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {getAssignmentsByStatus('IN_PROGRESS').length === 0 ? (
                        <p className="text-center text-text-faint text-xs py-4">No tasks in progress</p>
                      ) : (
                        getAssignmentsByStatus('IN_PROGRESS').map((a) => (
                          <div
                            key={a.id}
                            onClick={() => handleAssignmentStatusChange(a.id, 'IN_PROGRESS')}
                            className="p-3 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border transition-all duration-200 cursor-pointer group flex flex-col gap-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-semibold text-text-secondary group-hover:text-text transition-colors line-clamp-1">
                                {a.title}
                              </h5>
                              <ArrowRight className="w-3.5 h-3.5 text-text-faint group-hover:text-success transition-colors flex-shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-text-faint">
                              <span className="font-semibold text-warning">{a.subjectCode}</span>
                              <span>Due: {a.dueDate}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* SUBMITTED Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Submitted</span>
                      <Badge variant="success" size="sm">{getAssignmentsByStatus('SUBMITTED').length}</Badge>
                    </div>
                    
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {getAssignmentsByStatus('SUBMITTED').length === 0 ? (
                        <p className="text-center text-text-faint text-xs py-4">No submitted assignments</p>
                      ) : (
                        getAssignmentsByStatus('SUBMITTED').map((a) => (
                          <div
                            key={a.id}
                            className="p-3 rounded-lg bg-bg-elevated border border-border flex flex-col gap-2"
                          >
                            <div className="flex items-center gap-1.5 text-xs text-text-faint">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                              <span className="font-semibold text-text-secondary truncate line-clamp-1">{a.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-text-faint">
                              <span className="font-semibold text-success">{a.subjectCode}</span>
                              <span>Due: {a.dueDate}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            </div>

          </div>
        </motion.div>
      )}

      {/* --- POPUP DIALOGS --- */}

      {/* 1. Add Subject Modal */}
      <Modal isOpen={activeModal === 'subject'} onClose={() => setActiveModal(null)} title="Add Subject">
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Data Structures & Algorithms"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. CS201"
            value={subjectForm.code}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Credits (Hrs / Week)
            </label>
            <select
              value={subjectForm.credits}
              onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) })}
              className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5].map((c) => (
                <option key={c} value={c}>{c} Credits</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Subject</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Schedule Class Modal */}
      <Modal isOpen={activeModal === 'timetable'} onClose={() => setActiveModal(null)} title="Schedule Class Slot">
        <form onSubmit={handleTimetableSubmit} className="space-y-4">
          {subjects.length === 0 ? (
            <div className="p-3 rounded-lg bg-warning-muted border border-warning/30 text-warning text-xs flex flex-col gap-2">
              <span>You must create at least one subject before you can schedule class slots.</span>
              <button
                type="button"
                onClick={() => setActiveModal('subject')}
                className="w-fit text-xs font-semibold underline hover:text-warning-hover text-left cursor-pointer"
              >
                Create a Subject now
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                value={timetableForm.subjectId}
                onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: e.target.value })}
                className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Day of Week
            </label>
            <select
              value={timetableForm.dayOfWeek}
              onChange={(e) => setTimetableForm({ ...timetableForm, dayOfWeek: e.target.value })}
              className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {TIMETABLE_DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={timetableForm.startTime}
              onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={timetableForm.endTime}
              onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
              required
            />
          </div>
          <Input
            label="Room / Classroom Location"
            placeholder="e.g. Block C - Room 302"
            value={timetableForm.room}
            onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Schedule Class</Button>
          </div>
        </form>
      </Modal>

      {/* 3. Add Assignment Modal */}
      <Modal isOpen={activeModal === 'assignment'} onClose={() => setActiveModal(null)} title="Create New Assignment">
        <form onSubmit={handleAssignmentSubmit} className="space-y-4">
          <Input
            label="Assignment Title"
            placeholder="e.g. Complete Lab 6 report on sorting algorithms"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            required
          />
          {subjects.length === 0 ? (
            <div className="p-3 rounded-lg bg-warning-muted border border-warning/30 text-warning text-xs flex flex-col gap-2">
              <span>You must create at least one subject before you can add assignments.</span>
              <button
                type="button"
                onClick={() => setActiveModal('subject')}
                className="w-fit text-xs font-semibold underline hover:text-warning-hover text-left cursor-pointer"
              >
                Create a Subject now
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Associated Subject
              </label>
              <select
                value={assignmentForm.subjectId}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectId: e.target.value })}
                className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>
            </div>
          )}
          <Input
            label="Due Date"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={assignmentForm.dueDate}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Priority
            </label>
            <select
              value={assignmentForm.priority}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, priority: e.target.value })}
              className="w-full bg-bg-input border border-border rounded-lg p-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="accent" type="submit">Create Assignment</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default StudentPage;
