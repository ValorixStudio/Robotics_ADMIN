'use client'; 
import axios, { AxiosError } from "axios";
import { useAuth } from "@/provider/AuthProvider";
import { toast } from "react-toastify";

interface SetterRowPayload {
  url: string;
  bodyData: Record<string, any>; 
}

interface ApiErrorResponse {
  msg?: string;
  message?: string;
}

export const useSetter = () => {
  const { token } = useAuth();
  const callSetter = async <T = any>(value: SetterRowPayload): Promise<T | false> => {
    try {
      const res = await axios.post<T>(value.url, value.bodyData, {
        headers: {
          "x-api-key": "e3c13629562f577aa37635ffc824dd421641a988dbb562bd27a1d1ca7a6ec962fb79cd4262e2460905c7789340c9c1303c07f51a4a9b7a995816a61926ba0c34",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      return res.data;
    } catch (error) {
      console.error("API Error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.msg || "Something went wrong";
        
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
