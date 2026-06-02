import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,

  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lightsalmon-horse-915757.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'cornflowerblue-eland-784005.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'kavalakat-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'api.kavalakat.com',
      },
      {
        protocol: 'http',
        hostname: 'api.kavalakat.com',
      },
    ],
    localPatterns: [
      { pathname: '/assets/**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default config;