"use client";

import ApplicationLogo from "@/components/ApplicationLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import UserActions from "./UserActions";
import MobileBottomNav from "./MobileBottomNav";
import SearchBar from "@/components/SearchBar";
import { useNavigation } from "@/hooks/use-navigation";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const { brands, categories, loading, error } = useNavigation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Mock cart items count - replace with actual cart data
    const cartItemsCount = 0;

    if (error) {
        console.error('Navigation data error:', error);
    }

    const handleSearchClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 gap-4 items-center">
                    {/* Logo */}
                    <div className="flex items-center ltr:mr-4 rtl:ml-4">
                        <Link href="/">
                            <ApplicationLogo className="h-8 w-auto rounded-xl" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <DesktopNav 
                        brands={loading ? [] : brands} 
                        categories={loading ? [] : categories} 
                    />

                    {/* User Actions (Search, Wishlist, User/Login, Cart) */}
                    <UserActions
                        cartItemsCount={cartItemsCount}
                        onSearchClick={handleSearchClick}
                    />

                    {/* Mobile Navigation Menu Button */}
                    <MobileNav brands={loading ? [] : brands} categories={loading ? [] : categories} />
                </div>

                {/* Search Bar Component */}
                <SearchBar
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                />
            </header>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                cartItemsCount={cartItemsCount}
                onSearchClick={handleSearchClick}
            />
        </>
    );
}