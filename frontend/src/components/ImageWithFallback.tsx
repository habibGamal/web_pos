'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Package, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  showFallbackIcon?: boolean;
  fallbackClassName?: string;
}

/**
 * ImageWithFallback Component
 * 
 * A wrapper around Next.js Image component that provides automatic fallback handling
 * when the primary image fails to load. Supports both fallback images and fallback icons.
 * 
 * @param src - Primary image source (can be null/undefined)
 * @param fallbackSrc - Secondary image to show if primary fails
 * @param fallbackIcon - Icon component to show as fallback (defaults to Package)
 * @param showFallbackIcon - Whether to show fallback icon when no valid image (defaults to true)
 * @param fallbackClassName - Additional classes for fallback container
 * @param alt - Alt text for the image
 * @param className - Classes for the image element
 * @param fill - Whether image should fill its container
 * @param ...props - All other Next.js Image props
 */
export default function ImageWithFallback({
  src,
  fallbackSrc = '/images/product-placeholder.png',
  fallbackIcon: FallbackIcon = Package,
  showFallbackIcon = true,
  fallbackClassName,
  alt,
  className,
  fill = true,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src || null);
  const [hasError, setHasError] = useState(false);

  // Handle image load error
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Try fallback image first if available
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
        return;
      }
      // If fallback image also fails or no fallback image, show icon
      setImgSrc(null);
    }
  };

  // If no valid image source and should show fallback icon
  if (!imgSrc && showFallbackIcon) {
    return (
      <div 
        className={cn(
          'w-full h-full flex items-center justify-center bg-gray-100',
          fallbackClassName
        )}
        role="img"
        aria-label={alt}
      >
        <FallbackIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  // If no valid image source and shouldn't show fallback icon
  if (!imgSrc) {
    return (
      <div 
        className={cn(
          'w-full h-full bg-gray-100',
          fallbackClassName
        )}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

// Export a version with different default fallback icon for different contexts
export function ProductImageWithFallback(props: ImageWithFallbackProps) {
  return <ImageWithFallback fallbackSrc='/images/product-placeholder.png' fallbackIcon={Package} {...props} />;
}

export function BrandImageWithFallback(props: ImageWithFallbackProps) {
  return <ImageWithFallback fallbackSrc='/images/brand-placeholder.png' fallbackIcon={ImageIcon} {...props} />;
}

export function CategoryImageWithFallback(props: ImageWithFallbackProps) {
  return <ImageWithFallback fallbackSrc='/images/category-placeholder.png' fallbackIcon={ImageIcon} {...props} />;
}