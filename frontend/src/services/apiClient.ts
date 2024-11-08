import axios from "axios";
import { useDynamicToken } from "@/context/DynamicTokenContext";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const useAuthenticatedApiClient = () => {
  const { token } = useDynamicToken();

  apiClient.interceptors.request.use((config) => {
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  return apiClient;
};
