import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const normalizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(normalizeData);
  } else if (data !== null && typeof data === 'object') {
    const newData = { ...data };
    if (newData._id && !newData.id) {
      newData.id = newData._id.toString();
    }
    // Only handle top-level id normalization and basic populated fields
    Object.keys(newData).forEach(key => {
      if (key.endsWith('Id') && key !== '_id' && newData[key] && typeof newData[key] === 'object') {
        const alias = key.slice(0, -2);
        if (!(alias in newData)) {
          newData[alias] = normalizeData(newData[key]);
        }
      }
    });
    return newData;
  }
  return data;
};

apiClient.interceptors.response.use(
  (response) => {
    response.data = normalizeData(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
