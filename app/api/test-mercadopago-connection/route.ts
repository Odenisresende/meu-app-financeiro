import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY

    if (!accessToken || !publicKey) {
      return NextResponse.json({
        connected: false,
        error: "Tokens do Mercado Pago não configurados",
      })
    }

    // Teste simples da API do Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        error: `API retornou status ${response.status}`,
      })
    }

    return NextResponse.json({
      connected: true,
      message: "APIs do Mercado Pago funcionando",
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    })
  }
}
