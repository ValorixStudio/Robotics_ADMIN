import { useCallback, useState } from "react";
import axios, { type AxiosRequestConfig, type Method } from "axios";
import apiClient from "@/lib/apiClient";

interface ApiRequest<TBody = unknown> {
  url: string;
  bodyData?: TBody;
  config?: AxiosRequestConfig;
  method?: Method;
  multipart?: boolean;
}

export function useApi<TResponse = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const request = useCallback(
    async <TBody = unknown>({
      url,
      bodyData,
      config,
      method = "POST",
      multipart = bodyData instanceof FormData,
    }: ApiRequest<TBody>): Promise<TResponse | false> => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await apiClient.request<TResponse>({
          url,
          method,
          data: bodyData,
          ...config,
          headers: {
            ...(multipart ? { "Content-Type": "multipart/form-data" } : {}),
            ...config?.headers,
          },
        });
        console.log("API Response:", response.data);

        return response.data;
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.msg ?? error.response?.data?.message ?? error.message
          : "Something went wrong.";

        setErrorMessage(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request({ url, config, method: "GET" }),
    [request],
  );

  const post = useCallback(
    <TBody = unknown>(url: string, bodyData?: TBody, config?: AxiosRequestConfig) =>
      request({ url, bodyData, config, method: "POST" }),
    [request],
  );

  return {
    callGetter: request,
    errorMessage,
    get,
    isLoading,
    post,
    request,
  };
}
