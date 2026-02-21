import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  roles: string[];
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  twoFactorAuthToken?: string;
  twoFactorAuthRequired?: boolean;
}

export interface AvailableOrganization {
  id: string;
  name: string;
}

export interface AvailableOrganizationsResponse {
  organizations: AvailableOrganization[];
}

export type AuthMultiResponse = AuthResponse | AvailableOrganizationsResponse;

export function isAvailableOrganizationsResponse(
  response: AuthMultiResponse
): response is AvailableOrganizationsResponse {
  return "organizations" in response;
}

// Backward-compatible aliases
export type AvailableAccount = AvailableOrganization;
export type AvailableAccountsResponse = AvailableOrganizationsResponse;
export const isAvailableAccountsResponse = isAvailableOrganizationsResponse;

export interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginLinkRequest {
  email: string;
}

interface JwtPayload {
  exp?: number;
  organizationId?: string;
  sub?: string;
}

class AuthClient {
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";

  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  setTokens(authResponse: AuthResponse) {
    Cookies.set(this.ACCESS_TOKEN_KEY, authResponse.accessToken, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set(this.REFRESH_TOKEN_KEY, authResponse.refreshToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    this.scheduleTokenRefresh(authResponse.accessToken);
  }

  getAccessToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(this.REFRESH_TOKEN_KEY);
  }

  clearTokens() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  getOrganizationIdFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.organizationId || null;
    } catch {
      return null;
    }
  }

  // Backward-compatible alias
  getAccountIdFromToken(token: string): string | null {
    return this.getOrganizationIdFromToken(token);
  }

  private scheduleTokenRefresh(token: string) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return;

      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // Refresh 5 minutes before expiry (or 90% of token lifetime, whichever is sooner)
      const refreshTime = Math.max(
        timeUntilExpiry - 5 * 60 * 1000,
        timeUntilExpiry * 0.9
      );

      if (refreshTime > 0 && refreshTime < timeUntilExpiry) {
        console.log(
          `Scheduling token refresh in ${Math.round(refreshTime / 1000)}s`
        );
        this.refreshTimer = setTimeout(async () => {
          try {
            console.log("Proactively refreshing token");
            await this.refreshToken();
          } catch (error) {
            console.error("Proactive token refresh failed:", error);
          }
        }, refreshTime);
      }
    } catch (error) {
      console.error("Failed to schedule token refresh:", error);
    }
  }

  // API request wrapper with token handling
  async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipTokenRefresh = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (accessToken && !this.isTokenExpired(accessToken)) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else if (accessToken && !skipTokenRefresh) {
      try {
        await this.refreshToken();
        const newToken = this.getAccessToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        this.clearTokens();
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
      }
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response.text() as T;
  }

  async login(credentials: LoginRequest): Promise<AuthMultiResponse> {
    const response = await this.apiRequest<AuthMultiResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (
      !isAvailableOrganizationsResponse(response) &&
      !response.twoFactorAuthRequired
    ) {
      this.setTokens(response);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<void> {
    await this.apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async createLoginLink(email: string): Promise<void> {
    await this.apiRequest("/api/auth/login-link", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async exchangeLoginLink(
    token: string,
    organizationId?: string
  ): Promise<AuthMultiResponse> {
    const url = organizationId
      ? `/api/auth/exchange?token=${token}&organizationId=${organizationId}`
      : `/api/auth/exchange?token=${token}`;

    const response = await this.apiRequest<AuthMultiResponse>(url);

    if (!isAvailableOrganizationsResponse(response)) {
      this.setTokens(response);
    }

    return response;
  }

  async refreshToken(): Promise<AuthResponse> {
    if (this.isRefreshing && this.refreshPromise) {
      console.log(
        "Token refresh already in progress, awaiting existing promise"
      );
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("Starting token refresh");
    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const response = await this.apiRequest<AuthResponse>(
          "/api/auth/refresh",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          },
          true
        );

        this.setTokens(response);
        console.log("Token refresh successful");
        return response;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async getCurrentUser(): Promise<User> {
    return this.apiRequest<User>("/api/users/me");
  }

  async forgotPassword(email: string): Promise<void> {
    await this.apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // OAuth2 methods
  getGoogleOAuthUrl(): string {
    return `${API_BASE_URL}/api/oauth2/authorization/google`;
  }

  // 2FA methods
  async setup2FA(): Promise<{ secret: string; qrCode: string; uri: string }> {
    return this.apiRequest("/api/auth/2fa/setup");
  }

  async enable2FA(code: string): Promise<void> {
    await this.apiRequest("/api/auth/2fa/enable", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(code: string): Promise<void> {
    await this.apiRequest("/api/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async verify2FA(token: string, code: string): Promise<AuthResponse> {
    const response = await this.apiRequest<AuthResponse>(
      "/api/auth/2fa/verify",
      {
        method: "POST",
        body: JSON.stringify({ token, code }),
      }
    );
    this.setTokens(response);
    return response;
  }

  async get2FAStatus(): Promise<{ enabled: boolean }> {
    return this.apiRequest("/api/auth/2fa/status");
  }

  // Email confirmation
  async resendConfirmationEmail(): Promise<void> {
    await this.apiRequest("/api/auth/resend-confirmation", {
      method: "POST",
    });
  }

  // Organization switching
  async getAvailableOrganizations(): Promise<AvailableOrganization[]> {
    const response = await this.apiRequest<{ items: AvailableOrganization[] }>(
      "/api/organizations/available?size=100"
    );
    return response.items || [];
  }

  async switchOrganization(organizationId: string): Promise<AuthResponse> {
    const response = await this.apiRequest<AuthResponse>(
      "/api/organizations/switch",
      {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      }
    );
    this.setTokens(response);
    return response;
  }

  // Backward-compatible aliases
  async getAvailableAccounts(): Promise<AvailableOrganization[]> {
    return this.getAvailableOrganizations();
  }

  async switchAccount(organizationId: string): Promise<AuthResponse> {
    return this.switchOrganization(organizationId);
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout() {
    this.clearTokens();
    // Redirect to login page could be handled by the calling component
  }
}

export const authClient = new AuthClient();
