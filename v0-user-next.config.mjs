/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['jsdom', '@mozilla/readability'],
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    timeoutSeconds: 60, // Increase timeout for serverless functions
  },
};

export default nextConfig;

