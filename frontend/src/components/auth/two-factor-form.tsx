'use client'

import React, {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {useAuthStore} from '@/store/auth-store'
import {ArrowLeft, Loader2, Shield} from 'lucide-react'

const twoFactorSchema = z.object({
    code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits')
})

type TwoFactorForm = z.infer<typeof twoFactorSchema>

interface TwoFactorFormProps {
    onSuccess?: () => void
    onBack?: () => void
}

export function TwoFactorForm({onSuccess, onBack}: TwoFactorFormProps) {
    const {verify2FA, isLoading} = useAuthStore()
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: {errors},
        watch
    } = useForm<TwoFactorForm>({
        resolver: zodResolver(twoFactorSchema)
    })

    const code = watch('code', '')

    const onSubmit = async (data: TwoFactorForm) => {
        setError(null)

        try {
            const result = await verify2FA(data.code)

            if (result.success) {
                onSuccess?.()
            } else {
                setError('Invalid verification code. Please try again.')
            }
        } catch {
            setError('Verification failed. Please try again.')
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5"/>
                    Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                    Enter the 6-digit code from your authenticator app
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            {...register('code')}
                            disabled={isLoading}
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        {errors.code && (
                            <p className="text-sm text-red-600">{errors.code.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4"/>
                                    Verify Code
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Back to Sign In
                        </Button>
                    </div>
                </form>

                <div className="text-xs text-muted-foreground text-center space-y-2">
                    <p>
                        Open your authenticator app and enter the 6-digit code.
                    </p>
                    <p>
                        If you don&apos;t have access to your authenticator, contact support.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}