import { API_URLS } from "@/config/apiUrls";
import apiClient from "@/lib/apiClient";
import { authToken } from "@/lib/authToken";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@/services/api/types";

function readAccessToken(response: AuthResponse): string | undefined {
  return response.accessToken ?? response.token ?? response.data?.accessToken ?? response.data?.token;
}

async function authenticate(
  url: string,
  credentials: LoginRequest | RegisterRequest,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(url, credentials);
  const token = readAccessToken(data);

  if (!token) throw new Error("Authentication response did not include an access token.");

  authToken.set(token);
  return data;
}

export const authApi = {
  login: (credentials: LoginRequest) => authenticate(API_URLS.auth.login, credentials),
  register: (details: RegisterRequest) => authenticate(API_URLS.auth.register, details),

  async getProfile(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>(API_URLS.auth.profile);
    return data;
  },

  logout: () => authToken.remove(),
};
