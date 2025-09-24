"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Home, Search, ShoppingCart } from "lucide-react";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";

interface MobileBottomNavProps {
  cartItemsCount?: number;
  onSearchClick: () => void;
}

export default function MobileBottomNav({ cartItemsCount = 0, onSearchClick }: MobileBottomNavProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const t = useTranslations('common');
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-border bg-background lg:hidden">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Home Button */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label={t('home') || 'Home'}>
            <Home className="h-5 w-5" />
          </Link>
        </Button>

        {/* Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          aria-label={t('search') || 'Search'}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications Button - Only for authenticated users */}
        {user ? (
          <NotificationPanel />
        ) : (
          <div className="w-10"></div> // Spacer when not authenticated
        )}

        {/* Wishlist Button */}
        <Button variant="ghost" size="icon" asChild aria-label={t('wishlist') || 'Wishlist'}>
          <Link href="/wishlist">
            <Heart className="h-5 w-5" />
          </Link>
        </Button>

        {/* Cart Button with Item Count */}
        <Button variant="ghost" size="icon" asChild aria-label={t('cart') || 'Cart'}>
          <Link href="/cart">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute ltr:-right-2 rtl:-left-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}