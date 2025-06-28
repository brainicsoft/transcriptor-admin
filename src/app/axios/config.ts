// app/lib/api/api.ts
"use client" // Add this at the top to ensure client-side only

import { serverUrl } from '@/constants';
import axios from 'axios';
import { getCookie } from 'cookies-next';

const apiBaseURL = serverUrl;

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle token from cookies
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error accessing cookies:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;