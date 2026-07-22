import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow preview-z.ai subdomains to access dev server resources
  allowedDevOrigins: [
    "https://preview-chat-f8481b65-dc6b-40fd-846e-aca52f961888.space-z.ai",
    "*.space-z.ai",
    "*.vercel.app",
  ],
  // Vercel serverless: ensure /tmp is used for SQLite
  env: {
    JWT_SECRET: process.env.JWT_SECRET || "kmh-erp-jwt-secret-2026-secure",
  },
};

export default nextConfig;
