import api from './api';

const foodService = {
  getFoods: async () => {
    const response = await api.get('/api/foods');
    return response.data;
  },

  createFood: async (data) => {
    const response = await api.post('/api/foods', data);
    return response.data;
  },

  updateFood: async (id, data) => {
    const response = await api.put(`/api/foods/${id}`, data);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/api/foods/${id}`);
    return response.data;
  }
};

export default foodService;
