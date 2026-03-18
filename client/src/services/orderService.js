import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  updateOrderItemStatus: async (id, status) => {
    const response = await api.patch(`/api/order-items/${id}/status`, { status });
    return response.data;
  },
  closeOrder: async (id) => {
    const response = await api.post(`/api/orders/${id}/close`);
    return response.data;
  },
  getOrders: async (params) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  }
};

export default orderService;
