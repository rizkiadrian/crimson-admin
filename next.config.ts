import { ENV } from "@config/env";
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/api/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // 1. URL lokal yang akan dipanggil oleh Axios kita
        source: `${ENV.API_PROXY_PATH}/:path*`,

        // 2. Tujuan URL backend yang sebenarnya (Proxy Destination)
        // Gunakan environment variable agar aman
        destination: `${ENV.API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
