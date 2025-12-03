// services/api.js
import axios from 'axios';

// Adjust this base URL based on your Django setup
const API = axios.create({
  baseURL: 'http://localhost:8000/api/', // Make sure this ends with /api/
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

export default API;

// import axios from "axios";

// // Use environment variable for base URL
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? 'https://api.penden.online/api/'
//   : 'http://localhost:8000/api/';

// const API = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,  // Set to true if using session auth
// });

// // Request interceptor
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Token ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized - redirect to login
//       localStorage.removeItem("token");
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;






