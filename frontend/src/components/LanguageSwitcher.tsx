'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const [isChanging, setIsChanging] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const handleLanguageChange = async () => {
    setIsChanging(true);
    try {
      const newLocale = locale === 'en' ? 'ar' : 'en';
      router.replace(// @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: newLocale});
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLanguageChange}
      disabled={isChanging}
      className="flex items-center gap-2 transition-all duration-200"
      aria-label={`Switch to ${locale === 'en' ? 'Arabic' : 'English'}`}
    >
      {isChanging ? (
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {locale === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
}

// Compact version for mobile or smaller spaces
export function LanguageSwitcherCompact() {
  const [isChanging, setIsChanging] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const handleLanguageChange = async () => {
    setIsChanging(true);
    try {
      const newLocale = locale === 'en' ? 'ar' : 'en';
      router.replace(// @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: newLocale});
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
      disabled={isChanging}
      className="h-8 w-8 p-0"
      aria-label={`Switch to ${locale === 'en' ? 'Arabic' : 'English'}`}
    >
      {isChanging ? (
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      ) : (
        <span className="text-xs font-bold">
          {locale === 'en' ? 'ع' : 'EN'}
        </span>
      )}
    </Button>
  );
}