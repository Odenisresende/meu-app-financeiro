import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    console.log("🧪 Testando fluxo completo de pagamento...")

    const results = {
      timestamp: new Date().toISOString(),
      tests: {},
    }

    // 1. Testar variáveis de ambiente
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    const isSandbox = accessToken?.includes("TEST") || false
    const environment = isSandbox ? "SANDBOX" : "PRODUCTION"

    results.tests.environment = {
      success: true,
      environment,
      isSandbox,
      accessTokenExists: !!accessToken,
      publicKeyExists: !!publicKey,
      warning: isSandbox
        ? "⚠️ SANDBOX: Pagamentos são simulados"
        : "🚨 PRODUÇÃO: Pagamentos são REAIS e cobram dinheiro!",
    }

    // 2. Testar conexão com Mercado Pago
    try {
      const mpResponse = await fetch("https://api.mercadopago.com/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (mpResponse.ok) {
        const userData = await mpResponse.json()
        results.tests.mercadoPago = {
          success: true,
          status: mpResponse.status,
          userId: userData.id,
          email: userData.email,
          environment: userData.live_mode ? "PRODUCTION" : "SANDBOX",
        }
      } else {
        results.tests.mercadoPago = {
          success: false,
          status: mpResponse.status,
          error: "Erro na conexão com Mercado Pago",
        }
      }
    } catch (error: any) {
      results.tests.mercadoPago = {
        success: false,
        error: error.message,
      }
    }

    // 3. Testar conexão com Supabase
    try {
      const { data, error } = await supabase.from("user_subscriptions").select("count", { count: "exact" }).limit(1)

      results.tests.supabase = {
        success: !error,
        error: error?.message,
        tablesAccessible: !error,
      }
    } catch (error: any) {
      results.tests.supabase = {
        success: false,
        error: error.message,
      }
    }

    // 4. Testar webhook logs
    try {
      const { data, error, count } = await supabase.from("webhook_logs").select("*", { count: "exact" }).limit(1)

      results.tests.webhookLogs = {
        success: !error,
        count: count || 0,
        tableExists: !error,
      }
    } catch (error: any) {
      results.tests.webhookLogs = {
        success: false,
        error: error.message,
      }
    }

    // 5. Verificar URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    results.tests.urls = {
      success: !!baseUrl,
      baseUrl,
      webhookUrl: `${baseUrl}/api/webhooks/mercadopago`,
      isHttps: baseUrl?.startsWith("https://"),
    }

    // 6. Resumo geral
    const allTestsPassed = Object.values(results.tests).every((test: any) => test.success)

    results.summary = {
      allTestsPassed,
      environment,
      readyForTesting: allTestsPassed,
      warnings: [],
      recommendations: [],
    }

    if (isSandbox) {
      results.summary.warnings.push("Usando ambiente SANDBOX - pagamentos são simulados")
      results.summary.recommendations.push("Para produção, configure tokens de PRODUÇÃO")
    } else {
      results.summary.warnings.push("Usando ambiente PRODUÇÃO - pagamentos são REAIS!")
      results.summary.recommendations.push("Cuidado: pagamentos vão cobrar dinheiro real")
    }

    if (!results.tests.webhookLogs.count) {
      results.summary.recommendations.push("Configure o webhook no painel do Mercado Pago")
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("💥 Erro no teste do fluxo:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
