import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Production output configuration for Vercel
  output: "standalone",
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize for Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  
  // Enable compression
  compress: true,
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  
  // SWC minification is enabled by default in Next.js 16
  
  // Security headers with caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Cache static assets
      {
        source: "/:path*\\.(js|css|woff|woff2|png|jpg|jpeg|gif|svg|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache API responses with shorter TTL
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=10, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts", "@radix-ui/react-icons"],
    // Enable partial prerendering for better performance
    ppr: false, // Can enable when stable
  },
  
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    // Turbopack handles optimizations automatically
  },
};

export default nextConfig;
