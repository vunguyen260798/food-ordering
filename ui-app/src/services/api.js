import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Product API functions
export const productAPI = {
  // Get all products with optional search
  getAllProducts: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Order API functions
export const orderAPI = {
  // Get all orders with optional filters
  getAllOrders: async (status = '', paymentStatus = '') => {
    const params = {};
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', {
      items: orderData.items,
      specialInstructions: orderData.specialInstructions,
      paymentMethod: orderData.paymentMethod,
      customerName: 'Customer', 
      customerPhone: '', 
      deliveryAddress: '' 
    });
    return response.data;
  },

  // Check order payment status
  checkOrderStatus: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/payment-status`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, cancellationReason = '') => {
    const response = await api.put(`/orders/${id}/cancel`, { cancellationReason });
    return response.data;
  },
};

// Partner API functions
export const partnerAPI = {
  // Get all partners with optional search
  getAllPartners: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/partners', { params });
    return response.data;
  },

  // Get single partner by ID
  getPartnerById: async (id) => {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },

  // Create new partner
  createPartner: async (partnerData) => {
    const response = await api.post('/partners', partnerData);
    return response.data;
  },

  // Update partner
  updatePartner: async (id, partnerData) => {
    const response = await api.put(`/partners/${id}`, partnerData);
    return response.data;
  },

  // Delete partner
  deletePartner: async (id) => {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  },
};

export default api;
