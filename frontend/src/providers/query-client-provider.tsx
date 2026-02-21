'use client'

import React from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error: unknown) => {
                // Don't retry on 401 (unauthorized) or 403 (forbidden)
                if ((error as Error)?.message?.includes('401') || (error as Error)?.message?.includes('403')) {
                    return false
                }
                return failureCount < 3
            }
        }
    }
})

interface QueryClientProviderProps {
    children: React.ReactNode
}

export function ReactQueryProvider({children}: QueryClientProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}