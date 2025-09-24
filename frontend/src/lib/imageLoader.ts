'use client'

interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

/**
 * Custom image loader for Next.js Image component
 * Routes all image requests through the Laravel backend API endpoint /api/img/{path}
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Remove leading slash if present to avoid double slashes
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src
  
  // Get backend URL from environment variable with fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  // Build the image URL with width and quality parameters
  const url = new URL(`${baseUrl}/api/img/${cleanSrc}`)
  url.searchParams.set('w', width.toString())
  url.searchParams.set('q', (quality || 75).toString())
  
  return url.toString()
}