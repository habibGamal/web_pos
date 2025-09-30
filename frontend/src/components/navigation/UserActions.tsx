"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useI18n } from "@/hooks/use-i18n";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  cartItemsCount?: number;
  onSearchClick: () => void;
}

export default function UserActions({ cartItemsCount = 0, onSearchClick }: UserActionsProps) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const tCommon = useTranslations('common');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 ltr:ml-auto rtl:mr-auto">
        {/* Language Switcher */}
        <div className="hidden sm:flex">
          <LanguageSwitcher />
        </div>

        {/* Search Button */}
        <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            aria-label={tCommon('search')}
            className="hidden sm:flex"
        >
            <Search className="h-5 w-5" />
        </Button>

        {/* Notifications Button - Only for authenticated users */}
        {user && (
            // <div className="hidden sm:flex">
                <NotificationPanel />
            // </div>
        )}

        {/* Wishlist Button */}
        <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={t('common.wishlist') || 'Wishlist'}
        >
            <Link href="/wishlist">
                <Heart className="h-5 w-5" />
            </Link>
        </Button>

        {/* User/Login Menu */}
        {user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/profile">{t('common.profile') || 'Profile'}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/orders">{t('common.myOrders') || 'My Orders'}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                        {t('common.logout') || 'Logout'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ) : (
            <Button variant="ghost" size="icon" asChild>
                <Link href="/auth/login">
                    <User className="h-5 w-5" />
                </Link>
            </Button>
        )}

        {/* Cart Button with Item Count */}
        <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={t('common.cart') || 'Cart'}
            className="hidden sm:flex"
        >
            <Link href="/cart">
                <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                        <span className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground ltr:-right-2 rtl:-left-2 -top-2">
                            {cartItemsCount > 9 ? '9+' : cartItemsCount}
                        </span>
                    )}
                </div>
            </Link>
        </Button>
    </div>
  );
}