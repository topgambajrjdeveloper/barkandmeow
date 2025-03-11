import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // This will allow production builds to complete even with TypeScript errors
    // Only use temporarily while fixing actual issues
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  distDir: 'build',
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname:'res.cloudinary.com'
      }
    ]
  }
};

export default nextConfig;
