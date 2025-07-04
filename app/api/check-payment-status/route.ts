import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID é obrigatório" }, { status: 400 })
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 })
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao consultar pagamento" }, { status: response.status })
    }

    const paymentData = await response.json()

    return NextResponse.json({
      success: true,
      paymentId: paymentData.id,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      amount: paymentData.transaction_amount,
      currency: paymentData.currency_id,
      paymentMethod: paymentData.payment_method_id,
      dateCreated: paymentData.date_created,
      dateApproved: paymentData.date_approved,
      externalReference: paymentData.external_reference,
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
