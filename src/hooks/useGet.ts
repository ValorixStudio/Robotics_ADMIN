import { useCallback, useEffect, useRef, useState } from "react";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import apiClient from "@/lib/apiClient";

interface UseGetOptions<T> {
  config?: Omit<AxiosRequestConfig, "method" | "url" | "signal">;
  enabled?: boolean;
  initialData?: T | null;
  dependencies?: readonly unknown[];
}

interface UseGetResult<T> {
  data: T | null;
  error: AxiosError | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useGet<T = unknown>(
  url: string,
  {
    config,
    enabled = true,
    initialData = null,
    dependencies = [],
  }: UseGetOptions<T> = {},
): UseGetResult<T> {
  const configRef = useRef(config);
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<AxiosError | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [requestVersion, setRequestVersion] = useState(0);

  configRef.current = config;

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !url) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<T>(url, {
          ...configRef.current,
          signal: controller.signal,
        });
        setData(response.data);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(requestError as AxiosError);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void fetchData();
    return () => controller.abort();
  }, [url, enabled, requestVersion, ...dependencies]);

  return { data, error, isLoading, refetch };
}
