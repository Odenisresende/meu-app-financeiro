import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const headers = request.headers

    // Informações sobre a requisição atual
    const requestInfo = {
      host: headers.get("host"),
      user_agent: headers.get("user-agent"),
      x_forwarded_for: headers.get("x-forwarded-for"),
      x_real_ip: headers.get("x-real-ip"),
      cf_connecting_ip: headers.get("cf-connecting-ip"),
      x_vercel_ip_country: headers.get("x-vercel-ip-country"),
      x_vercel_ip_city: headers.get("x-vercel-ip-city"),
    }

    // Informações do ambiente Vercel
    const vercelInfo = {
      vercel_env: process.env.VERCEL_ENV,
      vercel_url: process.env.VERCEL_URL,
      vercel_region: process.env.VERCEL_REGION,
      deployment_url: headers.get("host"),
    }

    // Verificar se o domínio está correto
    const expectedDomains = ["www.orcamentoseuplanejamento.com.br", "orcamentoseuplanejamento.com.br"]

    const currentDomain = headers.get("host")
    const isDomainCorrect = expectedDomains.includes(currentDomain || "")

    return NextResponse.json({
      status: "success",
      message: "Teste de DNS executado",
      dns_info: {
        current_domain: currentDomain,
        expected_domains: expectedDomains,
        domain_correct: isDomainCorrect,
        ip_configured: "216.198.79.193 (Vercel IP)",
      },
      request_info: requestInfo,
      vercel_info: vercelInfo,
      recommendations: isDomainCorrect
        ? ["✅ Domínio está correto", "✅ DNS propagado", "🔍 Verificar cache do navegador"]
        : ["⚠️ Domínio não está correto", "🔍 Verificar configuração no Vercel", "🔍 Aguardar propagação DNS"],
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Erro no teste de DNS",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
