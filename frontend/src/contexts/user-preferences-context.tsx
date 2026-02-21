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
  ChartPreferences,
  ChartDisplayConfig,
  DefaultDocumentBehavior,
  SamplingPreferences,
  TimezonePreferences,
  defaultChartPreferences,
  defaultSamplingPreferences,
  defaultTimezonePreferences,
} from "@/types/saved-charts";
import type { UnitPreferences } from "@/lib/units";

// Re-export for backwards compatibility
export { usePreferencesDialog } from "./preferences-dialog-context";

const API_USERS_ME_ENDPOINT = "/api/users/me";

interface UserPreferencesContextValue {
  // Chart preferences
  chartPreferences: ChartPreferences;
  setDefaultDocumentBehavior: (
    behavior: DefaultDocumentBehavior
  ) => Promise<void>;
  updateDisplayConfig: (updates: Partial<ChartDisplayConfig>) => Promise<void>;
  updateUnitPreferences: (updates: Partial<UnitPreferences>) => Promise<void>;
  updateSamplingPreferences: (
    updates: Partial<SamplingPreferences>
  ) => Promise<void>;
  resetChartPreferences: () => Promise<void>;

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

  const chartPreferences = useMemo<ChartPreferences>(() => {
    if (!userData?.attributes) return defaultChartPreferences;
    const stored = userData.attributes.chartPreferences as
      | Partial<ChartPreferences>
      | undefined;
    return {
      ...defaultChartPreferences,
      ...stored,
      defaultDisplayConfig: {
        ...defaultChartPreferences.defaultDisplayConfig,
        ...stored?.defaultDisplayConfig,
      },
      unitPreferences: {
        ...defaultChartPreferences.unitPreferences,
        ...stored?.unitPreferences,
      },
      samplingPreferences: {
        ...defaultSamplingPreferences,
        ...stored?.samplingPreferences,
      },
    };
  }, [userData?.attributes]);

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

  const saveMutation = useMutation({
    mutationFn: async (newPrefs: ChartPreferences) => {
      const currentAttributes = userData?.attributes ?? {};
      const attributes = {
        ...currentAttributes,
        chartPreferences: newPrefs,
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
              chartPreferences: newPrefs,
            },
          };
        }
      );
    },
  });

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

  const setDefaultDocumentBehavior = useCallback(
    async (behavior: DefaultDocumentBehavior) => {
      const prefs = chartPreferences ?? defaultChartPreferences;
      const newPrefs: ChartPreferences = {
        ...prefs,
        defaultDocumentBehavior: behavior,
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [chartPreferences, saveMutation]
  );

  const updateDisplayConfig = useCallback(
    async (updates: Partial<ChartDisplayConfig>) => {
      const prefs = chartPreferences ?? defaultChartPreferences;
      const newPrefs: ChartPreferences = {
        ...prefs,
        defaultDisplayConfig: {
          ...prefs.defaultDisplayConfig,
          ...updates,
        },
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [chartPreferences, saveMutation]
  );

  const updateUnitPreferences = useCallback(
    async (updates: Partial<UnitPreferences>) => {
      const prefs = chartPreferences ?? defaultChartPreferences;
      const newPrefs: ChartPreferences = {
        ...prefs,
        unitPreferences: {
          ...prefs.unitPreferences,
          ...updates,
        },
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [chartPreferences, saveMutation]
  );

  const updateSamplingPreferences = useCallback(
    async (updates: Partial<SamplingPreferences>) => {
      const prefs = chartPreferences ?? defaultChartPreferences;
      const newPrefs: ChartPreferences = {
        ...prefs,
        samplingPreferences: {
          ...prefs.samplingPreferences,
          ...updates,
        },
      };
      await saveMutation.mutateAsync(newPrefs);
    },
    [chartPreferences, saveMutation]
  );

  const resetChartPreferences = useCallback(async () => {
    await saveMutation.mutateAsync(defaultChartPreferences);
  }, [saveMutation]);

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
      chartPreferences: chartPreferences ?? defaultChartPreferences,
      setDefaultDocumentBehavior,
      updateDisplayConfig,
      updateUnitPreferences,
      updateSamplingPreferences,
      resetChartPreferences,
      timezonePreferences: timezonePreferences ?? defaultTimezonePreferences,
      updateTimezonePreferences,
      getEffectiveTimezone,
      isLoading,
      isSaving: saveMutation.isPending || saveTimezoneMutation.isPending,
    }),
    [
      chartPreferences,
      setDefaultDocumentBehavior,
      updateDisplayConfig,
      updateUnitPreferences,
      updateSamplingPreferences,
      resetChartPreferences,
      timezonePreferences,
      updateTimezonePreferences,
      getEffectiveTimezone,
      isLoading,
      saveMutation.isPending,
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
