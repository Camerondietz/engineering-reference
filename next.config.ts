import { repo } from "@/lib/constants"; // your repo name if using github
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  /* only use below in github */
/*   basePath: `${repo}`,
  assetPrefix: `${repo}/`, */
};

export default nextConfig;
