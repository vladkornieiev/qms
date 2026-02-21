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
import {ArrowLeft, Loader2, Mail} from 'lucide-react'

const magicLinkSchema = z.object({
    email: z.string().email('Invalid email address')
})

type MagicLinkForm = z.infer<typeof magicLinkSchema>

interface MagicLinkFormProps {
    onBack?: () => void
}

export function MagicLinkForm({onBack}: MagicLinkFormProps) {
    const {loginWithMagicLink, isLoading} = useAuthStore()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [emailSent, setEmailSent] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<MagicLinkForm>({
        resolver: zodResolver(magicLinkSchema)
    })

    const onSubmit = async (data: MagicLinkForm) => {
        setError(null)
        setSuccess(false)

        try {
            const result = await loginWithMagicLink(data.email)

            if (result.success) {
                setSuccess(true)
                setEmailSent(data.email)
            } else {
                setError('Failed to send magic link. Please try again.')
            }
        } catch {
            setError('Failed to send magic link. Please try again.')
        }
    }

    if (success && emailSent) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <Mail className="h-12 w-12 text-blue-600 mx-auto"/>
                        <div>
                            <h3 className="text-lg font-semibold">Check Your Email</h3>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ve sent a magic link to <strong>{emailSent}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Click the link in the email to sign in. The link will expire in 15 minutes.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Button
                                onClick={() => {
                                    setSuccess(false)
                                    setEmailSent(null)
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Send Another Link
                            </Button>
                            <Button onClick={onBack} variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Back to Sign In
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5"/>
                    Magic Link
                </CardTitle>
                <CardDescription>
                    Enter your email address and we&apos;ll send you a link to sign in
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
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            {...register('email')}
                            disabled={isLoading}
                            autoFocus
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Sending magic link...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4"/>
                                    Send Magic Link
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

                <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>
                        We&apos;ll send you a secure link that will sign you in automatically.
                    </p>
                    <p>
                        No password required!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}