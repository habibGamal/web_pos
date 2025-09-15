"use client";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserPlus } from 'lucide-react';
import { RegisterForm } from '@/components/auth/register-form';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { useTranslations } from 'next-intl';

export default  function RegisterPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {t('auth.register.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('common.or')}{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('auth.register.subtitle')}
            </Link>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Social Login Options */}
          <SocialLoginButtons />

          <div className="relative">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              {/* <span className="bg-white px-2 text-sm text-gray-500">{dict.auth.register.continueWith}</span> */}
            </div>
          </div>

          {/* Registration Form */}
          <RegisterForm  />
        </CardContent>
      </Card>
    </div>
  );
}