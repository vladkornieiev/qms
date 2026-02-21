"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { accountsApi } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

const SEARCH_DEBOUNCE_MS = 300;

interface AccountFilterPopoverProps {
  value: string;
  label: string;
  onChange: (value: string, label: string) => void;
  restrictToIds?: string[];
}

export function AccountFilterPopover({
  value,
  label,
  onChange,
  restrictToIds,
}: AccountFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: accountsData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS, debouncedSearch],
    queryFn: () =>
      accountsApi.getAllAccounts({
        size: 50,
        ...(debouncedSearch && { query: debouncedSearch }),
      }),
  });

  const handleSelect = (accountId: string, accountName: string) => {
    onChange(accountId, accountName);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setSearch("");
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-52 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-52 rounded-md border bg-popover p-0 shadow-md"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchRef.current?.focus();
          }}
        >
          <div className="p-2 border-b">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-8 w-full rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {!search && (
              <button
                type="button"
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                onClick={() => handleSelect("all", "All organizations")}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === "all" ? "opacity-100" : "opacity-0"}`}
                />
                All organizations
              </button>
            )}
            {(accountsData?.items ?? [])
              .filter((account) => !restrictToIds || restrictToIds.includes(account.id))
              .map((account) => (
              <button
                type="button"
                key={account.id}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                onClick={() => handleSelect(account.id, account.name)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === account.id ? "opacity-100" : "opacity-0"}`}
                />
                <span className="truncate">{account.name}</span>
              </button>
            ))}
            {(accountsData?.items ?? []).length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No organizations found
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
