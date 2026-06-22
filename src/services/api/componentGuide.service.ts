import axios from "axios";
import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import type {
  ComponentGuide,
  CreateComponentGuideRequest,
  EntityId,
  MediaUploadResponse,
  UpdateComponentGuideRequest,
} from "@/services/api/types";

interface MediaUploadApiResponse {
  ok: boolean;
  media: {
    type: "IMAGE" | "VIDEO";
    url: string;
    absoluteUrl: string;
  };
}

interface ComponentGuideListResponse {
  ok?: boolean;
  guides?: ComponentGuide[];
  data?: ComponentGuide[];
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string; message?: string; msg?: string } | undefined;
    return responseData?.error ?? responseData?.message ?? responseData?.msg ?? error.message;
  }

  return error instanceof Error ? error.message : fallback;
}

export const componentGuideApi = {
  async list(): Promise<ComponentGuide[]> {
    try {
      const { data } = await apiClient.get<ComponentGuide[] | ComponentGuideListResponse>(
        API_URLS.componentGuides.create,
      );

      if (Array.isArray(data)) return data;
      return data.guides ?? data.data ?? [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to load component guides."));
    }
  },

  async create(guide: CreateComponentGuideRequest): Promise<ComponentGuide> {
    try {
      const { data } = await apiClient.post<ComponentGuide>(
        API_URLS.componentGuides.create,
        guide,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to save the component guide."));
    }
  },

  async update(guideId: EntityId, guide: UpdateComponentGuideRequest): Promise<ComponentGuide> {
    try {
      const { data } = await apiClient.patch<ComponentGuide>(
        API_URLS.componentGuides.byId(guideId),
        guide,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to update the component guide."));
    }
  },

  async remove(guideId: EntityId): Promise<void> {
    try {
      await apiClient.delete(API_URLS.componentGuides.byId(guideId));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to delete the component guide."));
    }
  },

  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<MediaUploadApiResponse>(
      API_URLS.componentGuides.uploadMedia,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    if (!data.media?.url) {
      throw new Error("Upload completed, but the server did not return a media URL.");
    }

    return {
      url: data.media.url,
      filename: data.media.url.split("/").pop(),
      type: data.media.type,
    };
  },
};
