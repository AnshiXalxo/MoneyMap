import axios from "axios";

// Base API URL - uses proxy in development, change for production
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("moneymap_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage (App will redirect to login)
      localStorage.removeItem("moneymap_token");
      localStorage.removeItem("moneymap_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
};

// ─── Transactions API ─────────────────────────────────────────────────────────
export const transactionsAPI = {
  getAll: () => api.get("/api/transactions"),
  create: (data) => api.post("/api/transactions", data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
};

export default api;
