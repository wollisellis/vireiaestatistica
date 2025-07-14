/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Next.js 15 configuration
  experimental: {
    // Add any experimental features here if needed
  },
  images: {
    domains: [],
  },

  // Remove standalone output for Vercel compatibility
  // output: 'standalone',
  // Ensure proper trailing slash handling
  trailingSlash: false,
  // Redirects are now handled by middleware for proper authentication checks
};

module.exports = nextConfig;
