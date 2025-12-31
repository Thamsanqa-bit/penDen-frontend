// Function to get CSRF token from cookies
function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
console.log('=== DEBUG API CONFIG ===');
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Window location:', window.location.href);
import axios from "axios";

// Use environment variable for base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.penden.store/api/'
    : 'http://127.0.0.1:8000/api/');;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  // Set to true if using session auth
});

API.defaults.timeout = 10000;
// Clear any cached requests
API.interceptors.request.use(config => {
  config.params = config.params || {};
  config.params['_t'] = new Date().getTime(); // Prevent caching
  return config;
});
// Request interceptor
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

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("token");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;






