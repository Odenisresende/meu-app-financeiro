import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token não configurado",
          details: "MERCADO_PAGO_ACCESS_TOKEN necessário",
        },
        { status: 400 },
      )
    }

    // Testa criação de preferência (sem salvar)
    const preferenceData = {
      items: [
        {
          title: "Teste - Premium",
          quantity: 1,
          unit_price: 17.0,
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pending`,
      },
      auto_return: "approved",
      external_reference: "test-payment",
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar preferência de teste",
          details: JSON.stringify(errorData, null, 2),
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "API de pagamento funcionando",
      details: "Preferência de teste criada com sucesso",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
