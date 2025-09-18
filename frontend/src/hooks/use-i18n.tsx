"use client";

import { useLocale, useTranslations } from 'next-intl';

export function useI18n() {
  const locale = useLocale();
  const t = useTranslations();
  
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  const getLocalizedField = (
    obj: any, 
    field: string, 
    fallback: string = ''
  ): string => {
    if (!obj) return fallback;
    
    // Try current locale first
    const localizedValue = obj[`${field}_${locale}`] || obj[field];
    
    // Fall back to any available localized field or the base field
    if (!localizedValue) {
      const fallbackValue = obj[`${field}_en`] || obj[`${field}_ar`] || obj[field];
      return fallbackValue || fallback;
    }
    
    return localizedValue;
  };

  return {
    locale,
    direction,
    t,
    getLocalizedField,
  };
}