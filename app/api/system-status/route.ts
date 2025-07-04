import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    checks: {
      supabase: false,
      mercadopago: false,
      webhook_table: false,
      subscriptions_table: false,
    },
    errors: [] as string[],
  }

  try {
    // Testar conexão Supabase
    const { data: supabaseTest, error: supabaseError } = await supabase.from("webhook_logs").select("count").limit(1)

    if (supabaseError) {
      status.errors.push(`Supabase: ${supabaseError.message}`)
    } else {
      status.checks.supabase = true
    }

    // Testar tabela webhook_logs
    const { data: webhookTest, error: webhookError } = await supabase.from("webhook_logs").select("*").limit(1)

    if (webhookError) {
      status.errors.push(`Webhook logs: ${webhookError.message}`)
    } else {
      status.checks.webhook_table = true
    }

    // Testar tabela user_subscriptions
    const { data: subscriptionTest, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .limit(1)

    if (subscriptionError) {
      status.errors.push(`User subscriptions: ${subscriptionError.message}`)
    } else {
      status.checks.subscriptions_table = true
    }

    // Testar Mercado Pago
    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (mpToken) {
      try {
        const mpResponse = await fetch("https://api.mercadopago.com/users/me", {
          headers: {
            Authorization: `Bearer ${mpToken}`,
          },
        })

        if (mpResponse.ok) {
          status.checks.mercadopago = true
        } else {
          status.errors.push(`Mercado Pago: Status ${mpResponse.status}`)
        }
      } catch (error: any) {
        status.errors.push(`Mercado Pago: ${error.message}`)
      }
    } else {
      status.errors.push("Mercado Pago: Token não configurado")
    }
  } catch (error: any) {
    status.errors.push(`Sistema: ${error.message}`)
  }

  const allChecksPass = Object.values(status.checks).every((check) => check === true)
  const httpStatus = allChecksPass ? 200 : 500

  return NextResponse.json(status, { status: httpStatus })
}
