import axios from "axios";

const api = axios.create({
  // Remplacez 5000 par 30002 pour passer par le tunnel NodePort
  baseURL: "http://localhost:30002/api", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;