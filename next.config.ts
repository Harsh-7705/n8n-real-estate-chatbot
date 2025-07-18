// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // ✅ Required for `next start` on Render
};

export default nextConfig;
