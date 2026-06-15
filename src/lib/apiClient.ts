import axios from "axios";
import { API_BASE_URL } from "@/config/apiUrls";
import { authToken } from "@/lib/authToken";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authToken.get();

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export default apiClient;
