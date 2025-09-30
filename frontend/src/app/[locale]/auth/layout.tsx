import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8">
        {children}
    </div>
  )
}
