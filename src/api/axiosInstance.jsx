import axios from "axios";

// Create a base instance
const api = axios.create({
  baseURL: "http://localhost:9999", // json-server URL
});

// Add a request interceptor to automatically inject token
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

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response && err.response.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login"; // or use navigate() if inside a React Router context
//     }
//     return Promise.reject(err);
//   }
// );

export default api;
