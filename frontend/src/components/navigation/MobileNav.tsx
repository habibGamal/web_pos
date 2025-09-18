"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FolderX, Menu, ShoppingBag } from "lucide-react";
import ApplicationLogo from "@/components/ApplicationLogo";
import { useI18n } from "@/hooks/use-i18n";
import { useSettings } from "@/hooks/use-settings";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import EmptyState from "@/components/ui/empty-state";

interface Brand {
  id: string;
  name: string;
  slug: string;
  display_image?: string | null;
  display_order: number;
  is_active: boolean;
  active_products_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  display_image?: string | null;
  display_order: number;
  is_active: boolean;
  active_products_count: number;
}

interface MobileNavProps {
    brands: Brand[];
    categories: Category[];
}

export default function MobileNav({ brands, categories }: MobileNavProps) {
    const { direction, t, getLocalizedField } = useI18n();
    const settings = useSettings();
    const isRtl = direction === "rtl";

    const showContactPage = settings.show_contact_page !== false;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side={isRtl ? "left" : "right"}
                className="w-[300px]"
            >
                <div className="flex flex-col gap-6 py-6 h-full overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto rounded-xl" />
                        </Link>
                        <LanguageSwitcher />
                    </div>

                    <nav className="flex flex-col space-y-4">
                        <SheetClose asChild>
                            <Link href="/" className="text-lg font-medium">
                                {t('common.home')}
                            </Link>
                        </SheetClose>

                        {/* Brands Section */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-muted-foreground">
                                {t('common.brands')}
                            </h3>
                            {brands && brands.length > 0 ? (
                                <div className="ltr:ml-4 rtl:mr-4 flex flex-col space-y-2">
                                    {brands.map((brand) => (
                                        <SheetClose key={brand.id} asChild>
                                            <Link
                                                href={`/search?brands[]=${brand.id}`}
                                                className="text-sm hover:text-primary"
                                            >
                                                {getLocalizedField(brand, "name")}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            ) : (
                                <div className="ltr:ml-4 rtl:mr-4">
                                    <EmptyState
                                        icon={<ShoppingBag size={24} />}
                                        title={t('common.noBrands')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Categories Section */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-muted-foreground">
                                {t('common.categories')}
                            </h3>
                            {categories && categories.length > 0 ? (
                                <div className="ltr:ml-4 rtl:mr-4 flex flex-col space-y-2">
                                    {categories.map((category) => (
                                        <SheetClose key={category.id} asChild>
                                            <Link
                                                href={`/search?categories[]=${category.id}`}
                                                className="text-sm hover:text-primary"
                                            >
                                                {getLocalizedField(
                                                    category,
                                                    "name"
                                                )}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            ) : (
                                <div className="ltr:ml-4 rtl:mr-4">
                                    <EmptyState
                                        icon={<FolderX size={24} />}
                                        title={t('common.noCategories')}
                                    />
                                </div>
                            )}
                        </div>

                        <SheetClose asChild>
                            <Link
                                href="/sections/4"
                                className="text-lg font-medium"
                            >
                                {t('common.bestSellers')}
                            </Link>
                        </SheetClose>
                        {showContactPage && (
                            <SheetClose asChild>
                                <Link href="/contact" className="text-lg font-medium">
                                    {t('common.contact')}
                                </Link>
                            </SheetClose>
                        )}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}