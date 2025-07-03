import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    if (!accessToken || !publicKey) {
      return NextResponse.json({
        status: "error",
        message: "Tokens do Mercado Pago não configurados",
        details: {
          access_token: accessToken ? "✅ Configurado" : "❌ Não configurado",
          public_key: publicKey ? "✅ Configurado" : "❌ Não configurado",
        },
      })
    }

    // Teste simples de conexão com MP
    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({
        status: "success",
        message: "Conexão com Mercado Pago OK",
        details: {
          access_token: "✅ Configurado e válido",
          public_key: "✅ Configurado",
          api_status: "✅ Conectado",
        },
      })
    } else {
      return NextResponse.json({
        status: "error",
        message: "Erro na conexão com Mercado Pago",
        details: {
          status_code: response.status,
          error: await response.text(),
        },
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Erro ao testar Mercado Pago",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
