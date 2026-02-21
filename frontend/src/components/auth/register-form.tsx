'use client'

import React, {useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {useAuthStore} from '@/store/auth-store'
import {CheckCircle, Loader2} from 'lucide-react'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
})

type RegisterForm = z.infer<typeof registerSchema>

interface RegisterFormProps {
    onSuccess?: () => void
    onSwitchToLogin?: () => void
}

export function RegisterForm({onSuccess, onSwitchToLogin}: RegisterFormProps) {
    const {register: registerUser, isLoading} = useAuthStore()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterForm) => {
        setError(null)
        setSuccess(false)

        try {
            const result = await registerUser(data.email, data.password, data.name)

            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    onSuccess?.()
                }, 2000)
            } else {
                setError('Registration failed. Please try again.')
            }
        } catch {
            setError('Registration failed. Please try again.')
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto"/>
                        <div>
                            <h3 className="text-lg font-semibold">Registration Successful!</h3>
                            <p className="text-sm text-muted-foreground">
                                Please check your email to verify your account.
                            </p>
                        </div>
                        <Button onClick={onSwitchToLogin} variant="outline">
                            Continue to Sign In
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                    Enter your information to create a new account
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
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...register('name')}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            {...register('email')}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="At least 8 characters"
                            {...register('password')}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Repeat your password"
                            {...register('confirmPassword')}
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <div className="text-xs text-muted-foreground text-center">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                </div>
            </CardContent>

            <CardFooter>
                <div className="text-sm text-center text-muted-foreground w-full">
                    Already have an account?{' '}
                    <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={onSwitchToLogin}
                    >
                        Sign in
                    </button>
                </div>
            </CardFooter>
        </Card>
    )
}