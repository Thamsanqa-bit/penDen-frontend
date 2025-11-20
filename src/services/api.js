import axios from "axios";

const API = axios.create({
  baseURL: "https://penden-backend.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional — attach token automatically if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;






