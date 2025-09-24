import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
 
const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    // Remove remotePatterns when using custom loader as they're not needed
    // All image requests will go through our custom loader
  },
};

export default withNextIntl(nextConfig);
