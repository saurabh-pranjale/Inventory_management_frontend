import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 });
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const errorMessage = (error) => error.response?.data?.message || 'Cannot reach the API. Check that the backend is running and MongoDB is connected.';
