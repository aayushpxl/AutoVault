import axios from 'axios';
console.log("ENV", import.meta.env.VITE_API_BASE_URL)
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api" // import from env
const instance = axios.create({
  baseURL: API_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
});
//interceptor
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;