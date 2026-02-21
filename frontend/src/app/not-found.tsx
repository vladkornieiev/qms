"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {ArrowLeft, Home} from 'lucide-react'

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                        {/* 404 Text */}
                        <div className="space-y-2">
                            <h1 className="text-6xl font-bold text-gray-900">404</h1>
                            <h2 className="text-xl font-semibold text-gray-700">Page Not Found</h2>
                            <p className="text-gray-600">
                                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4"/>
                                    Go Home
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => router.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Go Back
                            </Button>
                        </div>

                        {/* Help Links */}
                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-3">
                                Need help? Try these pages:
                            </p>
                            <div className="flex flex-col gap-2 text-sm">
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Sign In
                                </Link>
                                <Link href="/users" className="text-blue-600 hover:underline">
                                    Users
                                </Link>
                                <Link href="/profile" className="text-blue-600 hover:underline">
                                    Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}