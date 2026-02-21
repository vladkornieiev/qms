"use client";

import { useState, useMemo, useCallback } from "react";

export interface FilterState {
  dataSourceIds: string[];
  channel: string;
  fromTimestamp: string;
  toTimestamp: string;
}

const emptyFilters: FilterState = {
  dataSourceIds: [],
  channel: "",
  fromTimestamp: "",
  toTimestamp: "",
};

export interface UseFiltersOptions {
  /** Include channel in filter comparison (table page uses this, charts doesn't) */
  includeChannel?: boolean;
  /** Initial filter values */
  initialFilters?: Partial<FilterState>;
  /** Callback when filters are applied */
  onApply?: (filters: FilterState) => void;
}

export interface UseFiltersReturn {
  /** Filters currently applied to queries */
  appliedFilters: FilterState;
  /** Filters being edited (not yet applied) */
  pendingFilters: FilterState;
  /** Whether there are changes not yet applied */
  hasUnappliedChanges: boolean;
  /** Whether any filters are active (applied) */
  hasActiveFilters: boolean;
  /** Update a single pending filter field */
  updatePendingFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  /** Update multiple pending filter fields */
  updatePendingFilters: (updates: Partial<FilterState>) => void;
  /** Apply pending filters */
  applyFilters: () => void;
  /** Clear all filters (both pending and applied) */
  clearFilters: () => void;
  /** Reset pending filters to match applied filters */
  resetPending: () => void;
  /** Set data source (convenience method) */
  setDataSource: (dataSourceId: string | null) => void;
  /** Set filters directly (both pending and applied) - use for loading saved state */
  setFilters: (filters: Partial<FilterState>) => void;
}

function areFiltersEqual(
  a: FilterState,
  b: FilterState,
  includeChannel: boolean
): boolean {
  if (a.fromTimestamp !== b.fromTimestamp) return false;
  if (a.toTimestamp !== b.toTimestamp) return false;
  if (includeChannel && a.channel !== b.channel) return false;
  if (a.dataSourceIds.length !== b.dataSourceIds.length) return false;
  for (let i = 0; i < a.dataSourceIds.length; i++) {
    if (a.dataSourceIds[i] !== b.dataSourceIds[i]) return false;
  }
  return true;
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const { includeChannel = false, initialFilters, onApply } = options;

  const initialState: FilterState = {
    ...emptyFilters,
    ...initialFilters,
  };

  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialState);
  const [pendingFilters, setPendingFilters] =
    useState<FilterState>(initialState);

  const hasUnappliedChanges = useMemo(
    () => !areFiltersEqual(appliedFilters, pendingFilters, includeChannel),
    [appliedFilters, pendingFilters, includeChannel]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.dataSourceIds.length > 0 ||
      (includeChannel && appliedFilters.channel !== "") ||
      appliedFilters.fromTimestamp !== "" ||
      appliedFilters.toTimestamp !== ""
    );
  }, [appliedFilters, includeChannel]);

  const updatePendingFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setPendingFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updatePendingFilters = useCallback((updates: Partial<FilterState>) => {
    setPendingFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(pendingFilters);
    onApply?.(pendingFilters);
  }, [pendingFilters, onApply]);

  const clearFilters = useCallback(() => {
    setPendingFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    onApply?.(emptyFilters);
  }, [onApply]);

  const resetPending = useCallback(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const setDataSource = useCallback((dataSourceId: string | null) => {
    const dataSourceIds = dataSourceId ? [dataSourceId] : [];
    setPendingFilters((prev) => {
      const updated = { ...prev, dataSourceIds };
      setAppliedFilters(updated);
      onApply?.(updated);
      return updated;
    });
  }, [onApply]);

  const setFilters = useCallback((filters: Partial<FilterState>) => {
    const newFilters: FilterState = { ...emptyFilters, ...filters };
    setPendingFilters(newFilters);
    setAppliedFilters(newFilters);
  }, []);

  return {
    appliedFilters,
    pendingFilters,
    hasUnappliedChanges,
    hasActiveFilters,
    updatePendingFilter,
    updatePendingFilters,
    applyFilters,
    clearFilters,
    resetPending,
    setDataSource,
    setFilters,
  };
}
