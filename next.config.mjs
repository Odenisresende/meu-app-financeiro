/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'orcamentoseuplanejamento.com.br'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
