import axios from 'axios';
import { toast } from 'react-toastify';

console.log("ENV", import.meta.env.VITE_API_BASE_URL)
const API_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api" // import from env
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send Cookies to backend
});
//interceptor
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for Global Security Handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    // Check if it's a security-related response from PayloadGuard
    if (data?.securityStatus === 'WARNING') {
      toast.warn(data.message, {
        toastId: 'payload-guard-warning', // Prevent stacking
        className: 'security-warning-toast',
      });
    } else if (data?.securityStatus === 'BLOCKED' || error.response?.status === 401) {
      if (data?.securityStatus === 'BLOCKED') {
        toast.error(data.message, {
          toastId: 'payload-guard-blocked', // Prevent stacking
          className: 'security-blocked-toast',
          autoClose: 10000,
        });
      }

      // Emergency Logout Logic (for both blocked and unauthorized)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = "/login";
        }, data?.securityStatus === 'BLOCKED' ? 2000 : 500);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;