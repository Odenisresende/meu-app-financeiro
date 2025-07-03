import { NextResponse } from "next/server"

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "URL do app não configurada",
          details: "NEXT_PUBLIC_APP_URL necessária para webhook",
        },
        { status: 400 },
      )
    }

    const webhookUrl = `${appUrl}/api/webhooks/mercadopago`

    // Testa se webhook é acessível
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      })

      return NextResponse.json({
        success: true,
        message: "Webhook acessível",
        details: `URL: ${webhookUrl} - Status: ${response.status}`,
      })
    } catch (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: "Webhook não acessível",
          details: `URL: ${webhookUrl} - Erro: ${fetchError instanceof Error ? fetchError.message : "Erro desconhecido"}`,
        },
        { status: 400 },
      )
    }
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
