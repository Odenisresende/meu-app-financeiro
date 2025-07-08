"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Database } from "lucide-react"

export default function FixDatabaseStepByStep() {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const steps = [
    {
      title: "Passo 1: Criar Tabelas Básicas",
      description: "Criar estrutura das tabelas principais",
      script: "fix-database-step1.sql",
    },
    {
      title: "Passo 2: Configurar Segurança",
      description: "Habilitar RLS e criar políticas de segurança",
      script: "fix-database-step2.sql",
    },
    {
      title: "Passo 3: Otimizar Performance",
      description: "Criar índices e funções auxiliares",
      script: "fix-database-step3.sql",
    },
  ]

  const testDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-database-fix")
      const result = await response.json()

      setStepResults((prev) => [
        ...prev,
        {
          step: "Teste Final",
          success: result.success,
          message: result.message,
          details: result.data,
        },
      ])
    } catch (error: any) {
      setStepResults((prev) => [
        ...prev,
        {
          step: "Teste Final",
          success: false,
          message: "Erro ao testar banco",
          details: error.message,
        },
      ])
    }
    setIsLoading(false)
  }

  const getStepIcon = (index: number) => {
    if (index < currentStep) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (index === currentStep) return <Clock className="h-5 w-5 text-blue-500" />
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
  }

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "Concluído"
    if (index === currentStep) return "Em andamento"
    return "Pendente"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Database className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Correção do Banco de Dados</h1>
          <p className="text-gray-600">Siga os passos abaixo para corrigir a estrutura do banco de dados</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(index)}
                  <span className="text-sm mt-2 text-center max-w-24">{getStepStatus(index)}</span>
                </div>
                {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Cards */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className={`${
                index === currentStep ? "ring-2 ring-blue-500" : ""
              } ${index < currentStep ? "bg-green-50" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getStepIcon(index)}
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-sm font-mono">
                    📄 Execute o script: <strong>scripts/{step.script}</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Copie e cole o conteúdo do arquivo no SQL Editor do Supabase
                  </p>
                </div>

                {index <= currentStep && (
                  <Button onClick={() => setCurrentStep(index + 1)} disabled={index !== currentStep} className="w-full">
                    {index < currentStep ? "✅ Concluído" : "Marcar como Concluído"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Database */}
        {currentStep >= steps.length && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Teste Final
              </CardTitle>
              <CardDescription>Verificar se todas as correções foram aplicadas corretamente</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testDatabase} disabled={isLoading} className="w-full mb-4">
                {isLoading ? "Testando..." : "🧪 Testar Banco de Dados"}
              </Button>

              {stepResults.map((result, index) => (
                <Alert key={index} className={`mb-4 ${result.success ? "border-green-500" : "border-red-500"}`}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription>
                      <strong>{result.step}:</strong> {result.message}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Como executar os scripts:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Acesse o Supabase Dashboard</li>
                <li>Vá para SQL Editor</li>
                <li>Copie o conteúdo do script correspondente</li>
                <li>Cole no editor e clique em "Run"</li>
                <li>Marque o passo como concluído aqui</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
              <p className="text-sm text-yellow-800">
                Execute os scripts na ordem correta. Cada passo depende do anterior.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
