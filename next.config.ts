import type { NextConfig } from "next";

// Import server initialization
import "./server-init";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
