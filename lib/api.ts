import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (username: string, password: string) => api.post('auth/login', { username, password }),
  register: (data: any) => api.post('auth/register', data),
};
console.log("DEPLOYED API BASEURL:", API_URL);

// Request interceptor - add token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Warehouses API
export const warehousesAPI = {
  getAll: () => api.get('warehouses'),
  create: (data: any) => api.post('warehouses', data),
  update: (id: number, data: any) => api.put(`warehouses/${id}`, data),
  delete: (id: number) => api.delete(`warehouses/${id}`),
  setActive: (id: number) => api.patch(`warehouses/${id}/set-active`, {}),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('users'),
  create: (data: any) => api.post('users', data),
  update: (id: number, data: any) => api.put(`users/${id}`, data),
  delete: (id: number) => api.delete(`users/${id}`),
};

// Master Data API
export const masterDataAPI = {
  getAll: (page = 1, limit = 100, search = '') =>
    api.get(`master-data?page=${page}&limit=${limit}&search=${search}`),
  upload: (formData: FormData) =>
    api.post('master-data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUploadProgress: (jobId: string) => api.get(`master-data/upload/progress/${jobId}`),
  cancelUpload: (jobId: string) => api.delete(`master-data/upload/cancel/${jobId}`),
  getBatches: () => api.get('master-data/batches'),
  delete: (id: number) => api.delete(`master-data/${id}`),
  deleteBatch: (batchId: string) => api.delete(`master-data/batch/${batchId}`),
  getActiveUploads: () => api.get('master-data/upload/active'),

};

// Inbound API
export const inboundAPI = {
  createSingle: (data: any) => api.post('inbound', data),
  getMasterDataByWSN: (wsn: string) => api.get(`inbound/master-data/${wsn}`),
  bulkUpload: (formData: FormData) => api.post('inbound/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getAllInboundWSNs: () => api.get('inbound/wsns/all'),

  multiEntry: (entries: any[], warehouse_id: number) =>
  api.post('inbound/multi-entry', { entries, warehouse_id }),
  
  getWarehouseRacks: (warehouseId: number) => api.get(`inbound/racks/${warehouseId}`),
  getBatches: (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get(`inbound/batches${params}`);
  },
  deleteBatch: (batchId: string) => api.delete(`inbound/batches/${batchId}`),

  getBrands: (warehouseId?: number) => 
    api.get('inbound/brands', { params: { warehouse_id: warehouseId } }),
  
  getCategories: (warehouseId?: number) => 
    api.get('inbound/categories', { params: { warehouse_id: warehouseId } }),
  
  getAll: (page: number, limit: number, filters?: any) => 
    api.get('inbound', { 
      params: { 
        page, 
        limit, 
        warehouseId: filters?.warehouseId,
        search: filters?.search,
        brand: filters?.brand,
        category: filters?.category,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        batchId: filters?.batchId
      } 
    }),
};

// Racks API
export const rackAPI = {
  getAll: (warehouseId?: number) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get(`racks${params}`);
  },
  create: (data: any) => api.post('racks', data),
  bulkUpload: (formData: FormData) => api.post('racks/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: number, data: any) => api.put(`racks/${id}`, data),
  delete: (id: number) => api.delete(`racks/${id}`),
  toggleStatus: (id: number) => api.patch(`racks/${id}/toggle`),
  getByWarehouse: (warehouseId: number) => api.get('racks/by-warehouse', 
    { params: { warehouse_id: warehouseId } })

};
  

export default api;


// QC API
export const qcAPI = {
  createSingleQC: (data: any) => api.post('qc/single', data),
  multiQCEntry: (data: any) => api.post('qc/multi', data),
  bulkQCUpload: (formData: FormData) => api.post('qc/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getQCList: (params: any) => api.get('qc/list', { params }),
  getQCBatches: (warehouseId: number) => api.get('qc/batches', { params: { warehouseId } }),
  deleteQCBatch: (batchId: string) => api.delete(`qc/batch/${batchId}`),
  getInboundByWSN: (wsn: string, warehouseId: number) => api.get(`qc/inbound/${wsn}`, { params: { warehouse_id: warehouseId } }),
  getBrands: (warehouseId?: number) => api.get('qc/brands', { params: { warehouse_id: warehouseId } }),
  getCategories: (warehouseId?: number) => api.get('qc/categories', { params: { warehouse_id: warehouseId } }),
  //getExistingWSNs: (warehouseId: number) => api.get('qc/existing-wsns', { params: { warehouse_id: warehouseId } }),
  checkWSNExists: (wsn: string, warehouseId: number) => 
    api.get(`qc/check-wsn`, { params: { wsn, warehouse_id: warehouseId } }),
  
  updateSingleQC: (qcId: number, data: any) => 
    api.put(`qc/${qcId}`, data),
  
  getExistingWSNs: (warehouseId: number) => 
    api.get(`qc/existing-wsns`, { params: { warehouse_id: warehouseId } })
};




