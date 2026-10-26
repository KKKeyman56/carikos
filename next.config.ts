import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin Turbopack to this repo so it never scans parent folders. The repo
    // lives inside OneDrive and the user folder used to hold stray lockfiles,
    // which made Next resolve the wrong root and warn on every boot.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
