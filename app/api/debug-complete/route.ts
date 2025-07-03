import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico completo...")

    // Verificar ambiente
    const environment = {
      nodeEnv: process.env.NODE_ENV || "unknown",
      vercelEnv: process.env.VERCEL_ENV || "unknown",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "not_set",
    }

    // Verificar Mercado Pago
    const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const mpPublicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    const mpTest = {
      accessToken: !!mpAccessToken,
      publicKey: !!mpPublicKey,
      accessTokenLength: mpAccessToken?.length || 0,
      publicKeyLength: mpPublicKey?.length || 0,
      connectionTest: { status: 0, ok: false, statusText: "" },
      userInfo: null as any,
    }

    if (mpAccessToken) {
      try {
        const mpResponse = await fetch("https://api.mercadopago.com/users/me", {
          headers: { Authorization: `Bearer ${mpAccessToken}` },
        })
        mpTest.connectionTest = {
          status: mpResponse.status,
          ok: mpResponse.ok,
          statusText: mpResponse.statusText,
        }
        if (mpResponse.ok) {
          mpTest.userInfo = await mpResponse.json()
        }
      } catch (error: any) {
        mpTest.connectionTest = { status: 0, ok: false, statusText: error.message }
      }
    }

    // Verificar Supabase
    const supabaseTest = {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      connectionTest: { success: false, error: null as any },
    }

    try {
      const { data, error } = await supabase.from("webhook_logs").select("count").limit(1)
      supabaseTest.connectionTest = { success: !error, error: error?.message || null }
    } catch (error: any) {
      supabaseTest.connectionTest = { success: false, error: error.message }
    }

    // URLs importantes
    const urls = {
      webhook: `${environment.appUrl}/api/webhooks/mercadopago`,
      success: `${environment.appUrl}/payment/success`,
      failure: `${environment.appUrl}/payment/failure`,
      pending: `${environment.appUrl}/payment/pending`,
    }

    // Verificar logs de webhook
    const webhookLogs = {
      success: false,
      count: 0,
      recent: [] as any[],
      error: null as any,
    }

    try {
      const { data: logs, error: logsError } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (logsError) {
        webhookLogs.error = logsError.message
      } else {
        webhookLogs.success = true
        webhookLogs.count = logs?.length || 0
        webhookLogs.recent = logs || []
      }
    } catch (error: any) {
      webhookLogs.error = error.message
    }

    // Verificar subscriptions ativas
    const activeSubscriptions = {
      success: false,
      count: 0,
      recent: [] as any[],
      error: null as any,
    }

    try {
      const { data: subs, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(5)

      if (subsError) {
        activeSubscriptions.error = subsError.message
      } else {
        activeSubscriptions.success = true
        activeSubscriptions.count = subs?.length || 0
        activeSubscriptions.recent = subs || []
      }
    } catch (error: any) {
      activeSubscriptions.error = error.message
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment,
      mercadoPago: mpTest,
      supabase: supabaseTest,
      urls,
      webhookLogs,
      activeSubscriptions,
      status: "diagnostic_complete",
    })
  } catch (error: any) {
    console.error("💥 Erro no diagnóstico:", error)
    return NextResponse.json({
      error: "Erro no diagnóstico completo",
      details: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
