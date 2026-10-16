import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Отключаем cacheComponents и partialPrefetching, чтобы Next.js 16
  // не блокировал клиентские хуки RTK Query (Date.now) и useParams/usePathname
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
