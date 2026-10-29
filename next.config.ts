import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: process.env.NODE_ENV === 'development' ? undefined : 'export',
	basePath: process.env.NODE_ENV === 'development' ? "" : "/map",
	trailingSlash: true,
};

export default nextConfig;
