'use client'

import React, { useEffect } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AdminRouteProps {
    children: React.ReactNode
    requirePlatformAdmin?: boolean
}

export function AdminRoute({ children, requirePlatformAdmin = false }: AdminRouteProps) {
    const { canManageUsers, isPlatformAdmin } = usePermissions()
    const router = useRouter()

    const hasPermission = requirePlatformAdmin ? isPlatformAdmin() : canManageUsers()

    useEffect(() => {
        if (!hasPermission) {
            // Could redirect to dashboard instead
            // router.push('/dashboard')
        }
    }, [hasPermission, router])

    if (!hasPermission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            You don&apos;t have permission to access this page.
                            {requirePlatformAdmin
                                ? ' Only platform administrators can access this section.'
                                : ' This section is restricted to administrators.'}
                        </p>
                        <Button onClick={() => router.push('/dashboard')} className="w-full">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <>{children}</>
}
