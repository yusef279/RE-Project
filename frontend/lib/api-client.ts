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
    // If it's a Buffer or other special object, return as is
    if (data.type === 'Buffer' || data instanceof Blob) return data;

    const newData = { ...data };

    // Normalize id
    if (newData._id && !newData.id) {
      newData.id = newData._id.toString();
    }

    // Normalize relational properties (e.g., teacherId -> teacher)
    Object.keys(newData).forEach(key => {
      const value = newData[key];

      // Recursively normalize children
      newData[key] = normalizeData(value);

      // Alias *Id properties to their base names if they are populated (objects)
      if (key.endsWith('Id') && key !== '_id' && value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const alias = key.slice(0, -2);
        if (!(alias in newData)) {
          newData[alias] = newData[key];
        }
      }
    });

    return newData;
  }
  return data;
};

// Add a response interceptor to handle errors and normalize data
apiClient.interceptors.response.use(
  (response) => {
    response.data = normalizeData(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
