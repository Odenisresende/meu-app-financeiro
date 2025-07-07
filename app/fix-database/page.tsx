"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Database, RefreshCw, Settings, Wrench } from "lucide-react"

export default function FixDatabase() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)

  const verifyDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/verify-database-structure")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Erro na verificação:", error)
    } finally {
      setLoading(false)
    }
  }

  const fixDatabase = async () => {
    setFixing(true)
    try {
      const response = await fetch("/api/fix-database-columns", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        alert("✅ Banco de dados corrigido com sucesso!")
        // Verificar novamente após correção
        await verifyDatabase()
      } else {
        alert("❌ Erro ao corrigir: " + data.error)
      }
    } catch (error) {
      console.error("Erro na correção:", error)
      alert("❌ Erro na correção do banco")
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg border-0">
          <CardHeader style={{ backgroundColor: "#152638" }}>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Database className="h-6 w-6" />
              Correção do Banco de Dados
            </CardTitle>
            <p className="text-white/80 text-sm">Verificar e corrigir a estrutura do banco de dados</p>
          </CardHeader>
        </Card>

        {/* Ações */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Button
                onClick={verifyDatabase}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                Verificar Estrutura
              </Button>

              <Button
                onClick={fixDatabase}
                disabled={fixing || !results}
                className="flex items-center gap-2 bg-[#DDC067] text-[#152638] hover:opacity-90"
              >
                {fixing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                Corrigir Banco
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {results && (
          <div className="space-y-4">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Resumo da Verificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.data?.summary?.existing_tables || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tabelas Existentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {results.data?.summary?.total_missing_columns || 0}
                    </div>
                    <div className="text-sm text-gray-600">Colunas Faltantes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.data?.summary?.total_tables || 0}</div>
                    <div className="text-sm text-gray-600">Total de Tabelas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status das Tabelas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.data?.tables || {}).map(([tableName, tableInfo]: [string, any]) => (
                <Card key={tableName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {tableName}
                      </span>
                      {tableInfo.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant={tableInfo.exists ? "default" : "destructive"} className="mb-2">
                        {tableInfo.exists ? "Existe" : "Não Existe"}
                      </Badge>

                      {tableInfo.exists && (
                        <div>
                          <p className="text-sm font-medium mb-1">Colunas ({tableInfo.columns?.length || 0}):</p>
                          <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                            {tableInfo.columns?.map((col: any) => col.column_name).join(", ") || "Nenhuma"}
                          </div>
                        </div>
                      )}

                      {/* Colunas Faltantes */}
                      {results.data?.missing_columns?.[tableName]?.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Faltam colunas:</strong> {results.data.missing_columns[tableName].join(", ")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Como Usar</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                1. <strong>Clique "Verificar Estrutura"</strong> para analisar o banco
              </p>
              <p>
                2. <strong>Clique "Corrigir Banco"</strong> para adicionar colunas faltantes
              </p>
              <p>
                3. <strong>Verifique novamente</strong> para confirmar as correções
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
