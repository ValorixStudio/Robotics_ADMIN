import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type {
  ComponentGuide,
  CreateComponentGuideRequest,
  MediaUploadResponse,
} from "@/services/api/types";

export const componentGuideApi = {
  async create(guide: CreateComponentGuideRequest): Promise<ComponentGuide> {
    const { data } = await apiClient.post<ComponentGuide>(
      API_URLS.componentGuides.create,
      guide,
    );
    return data;
  },

  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<MediaUploadResponse>(
      API_URLS.componentGuides.uploadMedia,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },
};
