import api from './api';

/**
 * Service methods for Student Module (Academics & Timetable).
 */
const studentService = {
  // --- Subject Operations ---
  getSubjects: async () => {
    const response = await api.get('/student/subjects');
    return response.data;
  },

  addSubject: async (subjectData) => {
    const response = await api.post('/student/subjects', subjectData);
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/student/subjects/${id}`);
    return response.data;
  },

  updateAttendance: async (id, attended) => {
    const response = await api.patch(`/student/subjects/${id}/attendance`, null, {
      params: { attended },
    });
    return response.data;
  },

  // --- Assignment Operations ---
  getAssignments: async () => {
    const response = await api.get('/student/assignments');
    return response.data;
  },

  addAssignment: async (assignmentData) => {
    const response = await api.post('/student/assignments', assignmentData);
    return response.data;
  },

  updateAssignmentStatus: async (id, status) => {
    const response = await api.patch(`/student/assignments/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // --- Timetable Operations ---
  getTimetable: async () => {
    const response = await api.get('/student/timetable');
    return response.data;
  },

  addTimetableEntry: async (timetableData) => {
    const response = await api.post('/student/timetable', timetableData);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/student/analytics');
    return response.data;
  },

  getStudySchedule: async () => {
    const response = await api.get('/student/scheduler');
    return response.data;
  },
};

export default studentService;
