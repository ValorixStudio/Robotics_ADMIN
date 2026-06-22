import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type { Circuit, CreateCircuitRequest } from "@/services/api/types";

export const circuitApi = {
  async create(circuit: CreateCircuitRequest): Promise<Circuit> {
    console.log("Creating circuit with data:", circuit);
    const { data } = await apiClient.post<Circuit>(API_URLS.circuits.create, circuit);
    console.log("API Response:", data);
    return data;
  },
};
