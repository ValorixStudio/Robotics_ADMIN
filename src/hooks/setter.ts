'use client';
import axios, { AxiosError, Method } from "axios";
import { useAuth } from "@/provider/AuthProvider";
import { toast } from "react-toastify";
import { notifyUnauthorized } from "@/lib/authSession";

interface SetterRowPayload {
  url: string;
  bodyData?: Record<string, any> | FormData;
  method?: Method;
}

interface ApiErrorResponse {
  msg?: string;
  message?: string;
}

export const useSetter = () => {
  const { token } = useAuth();

  const callSetter = async <T = any>(value: SetterRowPayload): Promise<T | false> => {
    const { url, bodyData, method = "post" } = value;
    const isFormData = bodyData instanceof FormData;

    try {
      const res = await axios.request<T>({
        url,
        method,
        data: bodyData,
        headers: {
          "x-api-key": "e3c13629562f577aa37635ffc824dd421641a988dbb562bd27a1d1ca7a6ec962fb79cd4262e2460905c7789340c9c1303c07f51a4a9b7a995816a61926ba0c34",
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("API Error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 401) {
          notifyUnauthorized();
          toast.error("Session expired. Please login again.");
          return false;
        }

        const errorMessage =
          axiosError.response?.data?.msg ||
          axiosError.response?.data?.message ||
          "Something went wrong";

        console.log(errorMessage);
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }

      return false;
    }
  };

  return { callSetter };
};
