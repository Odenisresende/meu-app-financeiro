/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de imagem
  images: {
    domains: ['localhost', 'orcamentoseuplanejamento.com.br'],
    unoptimized: true
  },
  
  // Ignorar erros durante build (temporário)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurações experimentais para resolver problemas de importação
  experimental: {
    esmExternals: 'loose',
  },
  
  // Configuração de webpack para resolver problemas de módulos
  webpack: (config, { isServer }) => {
    // Resolver problemas de importação de módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // Configurações de output
  output: 'standalone',
  
  // Configurações de ambiente
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

export default nextConfig
