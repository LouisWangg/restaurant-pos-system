import api from './api';

const tableService = {
  getTables: async () => {
    const response = await api.get('/api/tables');
    return response.data;
  },

  getTableById: async (id) => {
    const response = await api.get(`/api/tables/${id}`);
    return response.data;
  },

  updateTableStatus: async (id, status) => {
    const response = await api.patch(`/api/tables/${id}/status`, { status });
    return response.data;
  }
};

export default tableService;
