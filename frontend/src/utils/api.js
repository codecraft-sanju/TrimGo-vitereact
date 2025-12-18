import axios from "axios";

const api = axios.create({
  // Vite uses import.meta.env instead of process.env
  baseURL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api` 
    : "https://trimgo-vitereact.onrender.com/api", 
  withCredentials: true, 
});

export default api;