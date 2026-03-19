/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ['sharp', 'canvas', 'jsdom'],
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/stats",
        permanent: false,
      },
    ];
  },
}

export default nextConfig
