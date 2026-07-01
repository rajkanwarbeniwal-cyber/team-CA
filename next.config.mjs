/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enforce strict type checking; fix type errors before building
    ignoreBuildErrors: false,
  },
  images: {
    // Use Next.js Image optimization for Taksha PNGs
    formats: ['image/avif', 'image/webp'],
  },

}

export default nextConfig
