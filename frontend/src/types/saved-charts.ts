export interface TimezonePreferences {
  enabled: boolean;
  timezone: string | null;
}

export const defaultTimezonePreferences: TimezonePreferences = {
  enabled: false,
  timezone: null,
};
