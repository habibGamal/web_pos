"use client";

import Link from "next/link";
import ApplicationLogo from "@/components/ApplicationLogo";
import { useI18n } from "@/hooks/use-i18n";
import { useSettings } from "@/hooks/use-settings";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
    const { t } = useI18n();
    const settings = useSettings();

    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <ApplicationLogo />
                        <p className="text-sm text-muted-foreground">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">
                            {t('footer.quickLinks')}
                        </h3>
                        <nav className="flex flex-col space-y-2">
                            <Link 
                                href="/" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('common.home')}
                            </Link>
                            <Link 
                                href="/search" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('common.search')}
                            </Link>
                            <Link 
                                href="/sections/4" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('common.bestSellers')}
                            </Link>
                            {settings.show_contact_page && (
                                <Link 
                                    href="/contact" 
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('common.contact')}
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">
                            {t('common.categories')}
                        </h3>
                        <nav className="flex flex-col space-y-2">
                            <Link 
                                href="/categories" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('footer.allCategories')}
                            </Link>
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">
                            {t('footer.support')}
                        </h3>
                        <nav className="flex flex-col space-y-2">
                            <Link 
                                href="/help" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('footer.help')}
                            </Link>
                            <Link 
                                href="/terms" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('footer.terms')}
                            </Link>
                            <Link 
                                href="/privacy" 
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('footer.privacy')}
                            </Link>
                        </nav>
                    </div>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} {settings.site_name}. {t('footer.allRightsReserved')}
                    </p>
                    <div className="flex space-x-4">
                        {/* Social media links can be added here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}