"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProductImageWithFallback } from "@/components/ImageWithFallback";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
    id: number;
    name: string;
    slug: string;
    price: number;
    featured_image?: string;
    brand?: {
        id: number;
        name: string;
    };
    category?: {
        id: number;
        name: string;
    };
}

interface SearchSuggestionsProps {
    query: string;
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function SearchSuggestions({
    query,
    onSuggestionClick,
    isOpen,
    onClose,
    className,
}: SearchSuggestionsProps) {
    const { t, direction, getLocalizedField } = useI18n();
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isRTL = direction === "rtl";

    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true);
            // Mock suggestions - replace with actual API call
            setTimeout(() => {
                setSuggestions([
                    {
                        id: 1,
                        name: `Product matching "${query}"`,
                        slug: "sample-product",
                        price: 99.99,
                        featured_image: "/images/sample-product.jpg",
                        brand: { id: 1, name: "Sample Brand" },
                        category: { id: 1, name: "Sample Category" }
                    }
                ]);
                setLoading(false);
            }, 300);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        } else {
            router.push(`/products/${suggestion.slug}`);
        }
        onClose();
    };

    const handleViewAllResults = () => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={cn("w-full", className)}>
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">{t('common.searching') || 'Searching...'}</span>
                </div>
            ) : suggestions.length > 0 ? (
                <div className="bg-background border rounded-lg shadow-lg">
                    <div className="p-4">
                        <h3 className="font-semibold mb-3">
                            {t('common.suggestions') || 'Suggestions'}
                        </h3>
                        <div className="space-y-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-md text-left"
                                >
                                    <div className="relative w-10 h-10 rounded-md overflow-hidden">
                                        <ProductImageWithFallback
                                            src={suggestion.featured_image}
                                            alt={suggestion.name}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium line-clamp-1">
                                            {suggestion.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {suggestion.brand?.name} • {suggestion.category?.name}
                                        </div>
                                        <div className="text-sm font-semibold text-primary">
                                            ${suggestion.price}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={handleViewAllResults}
                            variant="outline"
                            className="w-full mt-3"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            {t('common.viewAllResults') || 'View all results'}
                        </Button>
                    </div>
                </div>
            ) : query.length >= 2 ? (
                <div className="bg-background border rounded-lg shadow-lg p-4">
                    <div className="text-center py-4">
                        <div className="text-muted-foreground">
                            {t('common.noResultsFound') || 'No results found'}
                        </div>
                        <Button
                            onClick={handleViewAllResults}
                            variant="outline"
                            className="mt-2"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            {t('common.searchAnyway') || 'Search anyway'}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}