import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // swcMinify: false,
  images:{
    unoptimized: true,  // Necesario para exportación estática
    remotePatterns:[
      {
        protocol:'https',
        hostname:'res.cloudinary.com'
      }
    ]
  }
};

export default nextConfig;
