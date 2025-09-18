export function resolveImageSrc(src?: string | null): string {
  if (!src) return '/images/placeholder-product.jpg';

  // If src already looks like an absolute URL, return as-is
  try {
    const url = new URL(src);
    return url.toString();
  } catch (e) {
    // Not an absolute URL, continue
  }

  // If src starts with a leading slash, treat it as a local path
  if (src.startsWith('/')) return src;

  // Otherwise assume it's a storage relative path (e.g. "product-variants/..")
  // Prefix with backend base URL exposed via NEXT_PUBLIC_BACKEND_URL
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  // Ensure no trailing slash on backend
  const base = backend.replace(/\/+$|\/+$/g, '');

  if (!base) {
    // Fallback to absolute-path under /storage if backend not configured
    return `/storage/${src}`;
  }

  return `${base.replace(/\/+$/,'')}/storage/${src.replace(/^\/+/, '')}`;
}
