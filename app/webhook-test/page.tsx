import { WebhookTestPanel } from "@/components/webhook-test-panel"

export default function WebhookTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teste do Webhook</h1>
          <p className="text-gray-600 mt-2">Verifique se o webhook do Mercado Pago está funcionando</p>
        </div>
        <WebhookTestPanel />
      </div>
    </div>
  )
}
