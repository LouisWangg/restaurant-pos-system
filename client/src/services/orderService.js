import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  }
};

export default orderService;
