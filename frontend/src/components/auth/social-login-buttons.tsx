"use client";

import { Button } from '@/components/ui/button';
import { Chrome, Facebook } from 'lucide-react';
import { useTranslations } from 'next-intl';


export function SocialLoginButtons() {
  const t = useTranslations();
  const handleGoogleLogin = () => {
    // Add Google OAuth logic here
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    // Add Facebook OAuth logic here
    console.log('Facebook login clicked');
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-300 hover:bg-gray-50"
        onClick={handleGoogleLogin}
      >
        <Chrome className="h-4 w-4 mr-2" />
        {t('auth.register.google')}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full border-gray-300 hover:bg-gray-50"
        onClick={handleFacebookLogin}
      >
        <Facebook className="h-4 w-4 mr-2" />
        {t('auth.register.facebook')}
      </Button>
    </div>
  );
}