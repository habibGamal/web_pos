import { cn } from "@/lib/utils";
import NextImage from "next/image";

interface ImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Image({ 
  src, 
  alt, 
  className, 
  width = 32, 
  height = 32,
  priority = false 
}: ImageProps) {
  if (!src) {
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">N/A</span>
      </div>
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      priority={priority}
    />
  );
}