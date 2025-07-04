import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get("preferenceId")

    if (!preferenceId) {
      return NextResponse.json({ error: "preferenceId é obrigatório" }, { status: 400 })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 })
    }

    // Buscar informações da preferência
    const preferenceResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!preferenceResponse.ok) {
      return NextResponse.json(
        {
          error: "Erro ao buscar preferência",
          status: preferenceResponse.status,
          details: await preferenceResponse.text(),
        },
        { status: 500 },
      )
    }

    const preference = await preferenceResponse.json()

    // Buscar pagamentos relacionados à preferência
    let payments = []
    try {
      const paymentsResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${preference.external_reference}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        payments = paymentsData.results || []
      }
    } catch (error) {
      console.warn("Erro ao buscar pagamentos:", error)
    }

    return NextResponse.json({
      success: true,
      preference: {
        id: preference.id,
        external_reference: preference.external_reference,
        status: preference.status || "active",
        items: preference.items,
        created: preference.date_created,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      },
      payments: payments.map((payment: any) => ({
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        payment_method: payment.payment_method_id,
        created: payment.date_created,
        approved: payment.date_approved,
      })),
      summary: {
        total_payments: payments.length,
        approved_payments: payments.filter((p: any) => p.status === "approved").length,
        pending_payments: payments.filter((p: any) => p.status === "pending").length,
        rejected_payments: payments.filter((p: any) => p.status === "rejected").length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
