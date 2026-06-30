import api from './api';

/**
 * Service methods for Notes Module (Markdown Editor & Note management).
 */
const notesService = {
  getNotes: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  getNoteById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  addNote: async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  updateNote: async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  togglePinNote: async (id) => {
    const response = await api.patch(`/notes/${id}/pin`);
    return response.data;
  },

  uploadPdf: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/notes/${id}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePdf: async (id) => {
    const response = await api.delete(`/notes/${id}/pdf`);
    return response.data;
  },

  getPdfBlob: async (filePath) => {
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    const response = await api.get(`/notes/files/${fileName}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default notesService;
