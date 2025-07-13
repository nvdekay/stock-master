import axios from "axios";

// Tạo instance Axios với base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9999",
});

// Interceptor để thêm JWT token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

// Authentication functions
export const login = async (credentials) => {
  return await api.post("/auth/login", credentials);
};

export const register = async (userData) => {
  return await api.post("/auth/register", userData);
};

export const requestPasswordReset = async (email) => {
  return await api.post("/auth/reset-password", { email });
};

export const verifyToken = async (token) => {
  return await api.post("/auth/verify-token", { token });
};

// Tạo object API wrapper
const ApiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  // Add auth functions to ApiService
  login,
  register,
  requestPasswordReset,
  verifyToken,
};

export default ApiService;
