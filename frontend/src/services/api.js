import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, original: error });
  }
);

// Authentication APIs
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerCompany: (data) => api.post('/auth/register/company', data),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Admin APIs
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentById: (id) => api.get(`/admin/students/${id}`),
  toggleStudentStatus: (id, active) => api.patch(`/admin/students/${id}/status`, { active }),
  getCompanies: (params) => api.get('/admin/companies', { params }),
  getCompanyById: (id) => api.get(`/admin/companies/${id}`),
  createCompany: (data) => api.post('/admin/companies', data),
  updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),
  getDrives: (params) => api.get('/admin/drives', { params }),
  getDriveById: (id) => api.get(`/admin/drives/${id}`),
  createDrive: (data) => api.post('/admin/drives', data),
  updateDrive: (id, data) => api.put(`/admin/drives/${id}`, data),
  deleteDrive: (id) => api.delete(`/admin/drives/${id}`),
  getApplications: (params) => api.get('/admin/applications', { params }),
  getPolicy: () => api.get('/admin/policies'),
  updatePolicy: (data) => api.put('/admin/policies', data),
  downloadStudentResume: (id) => api.get(`/admin/students/${id}/resume`, { responseType: 'blob' }),
};

// Student APIs
export const studentApi = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  uploadResume: (formData) => api.post('/student/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadResume: () => api.get('/student/resume', { responseType: 'blob' }),
  getAvailableDrives: (search) => api.get('/student/drives', { params: { search } }),
  getDriveDetails: (id) => api.get(`/student/drives/${id}`),
  checkEligibility: (id) => api.get(`/student/drives/${id}/eligibility`),
  applyToDrive: (id) => api.post(`/student/drives/${id}/apply`),
  getMyApplications: (params) => api.get('/student/applications', { params }),
  withdrawApplication: (id) => api.post(`/student/applications/${id}/withdraw`),
  getMyInterviews: () => api.get('/student/interviews'),
  getMyOffers: () => api.get('/student/offers'),
  respondToOffer: (id, status, remarks) => api.post(`/student/offers/${id}/respond`, { status, remarks }),
};

// Company APIs
export const companyApi = {
  getProfile: () => api.get('/company/profile'),
  updateProfile: (data) => api.put('/company/profile', data),
  getDrives: (params) => api.get('/company/drives', { params }),
  getDriveById: (id) => api.get(`/company/drives/${id}`),
  createDrive: (data) => api.post('/company/drives', data),
  updateDrive: (id, data) => api.put(`/company/drives/${id}`, data),
  getDriveApplications: (driveId, params) => api.get(`/company/drives/${driveId}/applications`, { params }),
  updateApplicationStatus: (id, data) => api.put(`/company/applications/${id}/status`, data),
  getInterviews: (params) => api.get('/company/interviews', { params }),
  scheduleInterview: (data) => api.post('/company/interviews', data),
  updateInterview: (id, data) => api.put(`/company/interviews/${id}`, data),
  getOffers: (params) => api.get('/company/offers', { params }),
  issueOffer: (data) => api.post('/company/offers', data),
  downloadStudentResume: (studentId) => api.get(`/company/resumes/${studentId}`, { responseType: 'blob' }),
};

// Notifications APIs
export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

export default api;
