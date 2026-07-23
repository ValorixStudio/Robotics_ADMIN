import axios from "axios";
import { API_BASE_URL, API_KEY } from "@/config/apiUrls";
import { authToken } from "@/lib/authToken";
import { notifyUnauthorized } from "@/lib/authSession";

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

  if (API_KEY) config.headers["x-api-key"] = API_KEY;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
