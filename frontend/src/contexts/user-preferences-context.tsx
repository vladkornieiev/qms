"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  useCurrentUserWithAttributes,
  CURRENT_USER_QUERY_KEY,
  type CurrentUserWithAttributes,
} from "@/hooks/use-current-user-with-attributes";
import {
  TimezonePreferences,
  defaultTimezonePreferences,
} from "@/types/saved-charts";

// Re-export for backwards compatibility
export { usePreferencesDialog } from "./preferences-dialog-context";

const API_USERS_ME_ENDPOINT = "/api/users/me";

interface UserPreferencesContextValue {
  // Timezone preferences
  timezonePreferences: TimezonePreferences;
  updateTimezonePreferences: (
    updates: Partial<TimezonePreferences>
  ) => Promise<void>;
  getEffectiveTimezone: () => string;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
}

const UserPreferencesContext =
  createContext<UserPreferencesContextValue | null>(null);

interface UserPreferencesProviderProps {
  children: React.ReactNode;
}

export function UserPreferencesProvider({
  children,
}: UserPreferencesProviderProps) {
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useCurrentUserWithAttributes();

  const timezonePreferences = useMemo<TimezonePreferences>(() => {
    if (!userData?.attributes) return defaultTimezonePreferences;
    const stored = userData.attributes.timezonePreferences as
      | Partial<TimezonePreferences>
      | undefined;
    return {
      ...defaultTimezonePreferences,
      ...stored,
    };
  }, [userData?.attributes]);

  const saveTimezoneMutation = useMutation({
    mutationFn: async (newPrefs: TimezonePreferences) => {
      const currentAttributes = userData?.attributes ?? {};
      const attributes = {
        ...currentAttributes,
        timezonePreferences: newPrefs,
      };
      await authClient.apiRequest(API_USERS_ME_ENDPOINT, {
        method: "PATCH",
        body: JSON.stringify({ attributes }),
      });
      return newPrefs;
    },
    onSuccess: (newPrefs) => {
      queryClient.setQueryData(
        CURRENT_USER_QUERY_KEY,
        (old: CurrentUserWithAttributes | null | undefined) => {
          if (!old) return old;
          return {
            ...old,
            attributes: {
              ...old.attributes,
              timezonePreferences: newPrefs,
            },
          };
        }
      );
    },
  });

  const updateTimezonePreferences = useCallback(
    async (updates: Partial<TimezonePreferences>) => {
      const prefs = timezonePreferences ?? defaultTimezonePreferences;
      const newPrefs: TimezonePreferences = {
        ...prefs,
        ...updates,
      };
      await saveTimezoneMutation.mutateAsync(newPrefs);
    },
    [timezonePreferences, saveTimezoneMutation]
  );

  const getEffectiveTimezone = useCallback(() => {
    const prefs = timezonePreferences ?? defaultTimezonePreferences;
    if (prefs.enabled && prefs.timezone) {
      return prefs.timezone;
    }
    // Return browser's timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, [timezonePreferences]);

  const preferencesValue: UserPreferencesContextValue = useMemo(
    () => ({
      timezonePreferences: timezonePreferences ?? defaultTimezonePreferences,
      updateTimezonePreferences,
      getEffectiveTimezone,
      isLoading,
      isSaving: saveTimezoneMutation.isPending,
    }),
    [
      timezonePreferences,
      updateTimezonePreferences,
      getEffectiveTimezone,
      isLoading,
      saveTimezoneMutation.isPending,
    ]
  );

  return (
    <UserPreferencesContext.Provider value={preferencesValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
}
