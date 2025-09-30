"use client";

import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { FolderX, ShoppingBag } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useSettings } from "@/hooks/use-settings";
import EmptyState from "@/components/ui/empty-state";
import { BrandImageWithFallback } from "@/components/ImageWithFallback";

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

interface DesktopNavProps {
    brands: Brand[];
    categories: Category[];
}

export default function DesktopNav({ brands, categories }: DesktopNavProps) {
    const { t, getLocalizedField, direction } = useI18n();
    const settings = useSettings();

    const showContactPage = settings.show_contact_page !== false;

    return (
        <div className="hidden flex-1 lg:flex">
            <NavigationMenu dir={direction as "ltr" | "rtl"}>
                <NavigationMenuList dir={direction as "ltr" | "rtl"}>
                    <NavigationMenuItem className="rtl:mx-1">
                        <Link href="/" className={navigationMenuTriggerStyle()}>
                            {t('common.home')}
                        </Link>
                    </NavigationMenuItem>

                    {/* Brands Dropdown */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            {t('common.brands')}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            {brands && brands.length > 0 ? (
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {brands.map((brand) => (
                                        <li key={brand.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/search?brands[]=${brand.id}`}
                                                    className="flex items-center gap-2 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="relative w-[30px] h-[30px] rounded-md overflow-hidden">
                                                        <BrandImageWithFallback
                                                            src={brand.display_image}
                                                            alt={getLocalizedField(
                                                                brand,
                                                                "name"
                                                            )}
                                                            className="object-contain object-center"
                                                        />
                                                    </div>
                                                    <div className="text-sm font-medium leading-none">
                                                        {getLocalizedField(
                                                            brand,
                                                            "name"
                                                        )}
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="w-[300px] p-6">
                                    <EmptyState
                                        icon={<ShoppingBag />}
                                        title={t('common.noBrands')}
                                        description={t('common.noBrandsDescription')}
                                    />
                                </div>
                            )}
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Categories Dropdown */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            {t('common.categories')}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            {categories && categories.length > 0 ? (
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/search?categories[]=${category.id}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="text-sm font-medium leading-none">
                                                        {getLocalizedField(
                                                            category,
                                                            "name"
                                                        )}
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="w-[300px] p-6">
                                    <EmptyState
                                        icon={<FolderX size={32} />}
                                        title={t('common.noCategories')}
                                        description={t('common.noCategoriesDescription')}
                                    />
                                </div>
                            )}
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link
                            href="/sections/4"
                            className={navigationMenuTriggerStyle()}
                        >
                            {t('common.bestSellers')}
                        </Link>
                    </NavigationMenuItem>

                    {showContactPage && (
                        <NavigationMenuItem>
                            <Link
                                href="/contact"
                                className={navigationMenuTriggerStyle()}
                            >
                                {t('common.contact')}
                            </Link>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}