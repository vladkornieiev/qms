import { create } from "zustand";
import {
  authClient,
  type User,
  type AvailableOrganization,
  isAvailableOrganizationsResponse,
} from "@/lib/auth-client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  twoFactorToken: string | null;

  // Actions
  setInitialized: (initialized: boolean) => void;
  setUser: (user: User) => void;
  login: (
    email: string,
    password: string,
    organizationId?: string
  ) => Promise<{
    success: boolean;
    requires2FA?: boolean;
    requiresOrganizationSelection?: boolean;
    availableOrganizations?: AvailableOrganization[];
  }>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean }>;
  logout: () => void;
  loginWithMagicLink: (email: string) => Promise<{ success: boolean }>;
  exchangeMagicLink: (
    token: string,
    organizationId?: string
  ) => Promise<{
    success: boolean;
    user?: User;
    requiresOrganizationSelection?: boolean;
    availableOrganizations?: AvailableOrganization[];
  }>;
  verify2FA: (code: string) => Promise<{ success: boolean }>;
  loadUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  twoFactorToken: null,

  setInitialized: (initialized: boolean) => {
    set({ isInitialized: initialized });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  login: async (email: string, password: string, organizationId?: string) => {
    set({ isLoading: true });
    try {
      const response = await authClient.login({ email, password, organizationId });

      // Check if user needs to select an organization
      if (isAvailableOrganizationsResponse(response)) {
        set({ isLoading: false });
        return {
          success: true,
          requiresOrganizationSelection: true,
          availableOrganizations: response.organizations,
        };
      }

      // Check if 2FA is required
      if (response.twoFactorAuthRequired) {
        set({
          twoFactorToken: response.twoFactorAuthToken!,
          isLoading: false,
        });
        return { success: true, requires2FA: true };
      }

      // Load user data after successful login
      await get().loadUser();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    set({ isLoading: true });
    try {
      await authClient.register({ email, password, firstName, lastName });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  logout: () => {
    authClient.logout();
    set({
      user: null,
      isAuthenticated: false,
      twoFactorToken: null,
      isLoading: false,
    });
    // Redirect to login page
    globalThis.location.href = "/login";
  },

  loginWithMagicLink: async (email: string) => {
    set({ isLoading: true });
    try {
      await authClient.createLoginLink(email);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Magic link creation failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  exchangeMagicLink: async (token: string, organizationId?: string) => {
    set({ isLoading: true });
    try {
      const response = await authClient.exchangeLoginLink(token, organizationId);

      // Check if user needs to select an organization
      if (isAvailableOrganizationsResponse(response)) {
        set({ isLoading: false });
        return {
          success: true,
          requiresOrganizationSelection: true,
          availableOrganizations: response.organizations,
        };
      }

      await get().loadUser();
      const { user } = get();
      set({ isLoading: false });
      return { success: true, user: user || undefined };
    } catch (error) {
      console.error("Magic link exchange failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  verify2FA: async (code: string) => {
    const { twoFactorToken } = get();
    if (!twoFactorToken) return { success: false };

    set({ isLoading: true });
    try {
      await authClient.verify2FA(twoFactorToken, code);
      await get().loadUser();
      set({
        twoFactorToken: null,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      console.error("2FA verification failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  loadUser: async () => {
    if (!authClient.isAuthenticated()) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authClient.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      // Clear tokens on error
      authClient.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      await authClient.forgotPassword(email);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Forgot password failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true });
    try {
      await authClient.resetPassword(token, newPassword);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Reset password failed:", error);
      set({ isLoading: false });
      return { success: false };
    }
  },
}));
