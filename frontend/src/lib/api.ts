import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/";

//localhost:8080/api/team/standings/10fc1f14-88d1-4549-a703-5186dad81d70

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Request interceptor to add auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Auto logout if 401 response
//       localStorage.removeItem("authToken");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
