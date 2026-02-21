'use client'

import React, {useState} from 'react'
import {LoginForm} from './login-form'
import {RegisterForm} from './register-form'
import {MagicLinkForm} from './magic-link-form'
import {TwoFactorForm} from './two-factor-form'

type AuthView = 'login' | 'register' | 'magic-link' | '2fa'

interface AuthLayoutProps {
    initialView?: AuthView
    onSuccess?: () => void
}

export function AuthLayout({initialView = 'login', onSuccess}: AuthLayoutProps) {
    const [currentView, setCurrentView] = useState<AuthView>(initialView)

    const handleSuccess = () => {
        // Default redirect to dashboard if no onSuccess handler
        if (onSuccess) {
            onSuccess()
        } else {
            globalThis.location.href = '/dashboard'
        }
    }

    const handleSwitch2FA = () => {
        setCurrentView('2fa')
    }

    switch (currentView) {
        case 'register':
            return (
                <RegisterForm
                    onSuccess={() => setCurrentView('login')}
                    onSwitchToLogin={() => setCurrentView('login')}
                />
            )

        case 'magic-link':
            return (
                <MagicLinkForm
                    onBack={() => setCurrentView('login')}
                />
            )

        case '2fa':
            return (
                <TwoFactorForm
                    onSuccess={handleSuccess}
                    onBack={() => setCurrentView('login')}
                />
            )

        case 'login':
        default:
            return (
                <LoginForm
                    onSuccess={handleSuccess}
                    onSwitchToRegister={() => setCurrentView('register')}
                    onSwitchToMagicLink={() => setCurrentView('magic-link')}
                    onSwitch2FA={handleSwitch2FA}
                />
            )
    }
}