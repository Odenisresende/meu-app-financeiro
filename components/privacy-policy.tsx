"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail, Calendar } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader style={{ backgroundColor: "#152638" }}>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Política de Privacidade - Controle Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Data de atualização */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Última atualização: {new Date().toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          {/* 1. Introdução */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              1. Introdução
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Esta Política de Privacidade descreve como o <strong>Controle Financeiro - Seu Planejamento</strong>{" "}
              coleta, usa, armazena e protege suas informações pessoais, em conformidade com a Lei Geral de Proteção de
              Dados (LGPD - Lei 13.709/2018).
            </p>
          </section>

          {/* 2. Dados coletados */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              2. Dados Pessoais Coletados
            </h2>
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">✅ Dados que coletamos:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • <strong>Nome completo</strong> - para personalização da conta
                  </li>
                  <li>
                    • <strong>Endereço de email</strong> - para login e comunicações
                  </li>
                  <li>
                    • <strong>Transações financeiras</strong> - valores, categorias, datas que você adiciona
                  </li>
                  <li>
                    • <strong>Preferências</strong> - categorias personalizadas e configurações
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">❌ Dados que NÃO coletamos:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• CPF, RG ou outros documentos</li>
                  <li>• Dados bancários (senhas, números de conta)</li>
                  <li>• Informações de cartão de crédito</li>
                  <li>• Localização geográfica</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Finalidade */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              3. Finalidade do Tratamento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">Utilizamos seus dados pessoais para:</p>
            <ul className="text-gray-700 space-y-1 ml-4">
              <li>• Fornecer o serviço de controle financeiro pessoal</li>
              <li>• Autenticar e gerenciar sua conta</li>
              <li>• Gerar relatórios e gráficos personalizados</li>
              <li>• Melhorar nossos serviços e funcionalidades</li>
              <li>• Comunicar atualizações importantes do sistema</li>
            </ul>
          </section>

          {/* 4. Base legal */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              4. Base Legal
            </h2>
            <p className="text-gray-700 leading-relaxed">
              O tratamento dos seus dados pessoais é baseado no seu <strong>consentimento livre e informado</strong>,
              conforme Art. 7º, I da LGPD. Você pode retirar seu consentimento a qualquer momento.
            </p>
          </section>

          {/* 5. Compartilhamento */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              5. Compartilhamento de Dados
            </h2>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-yellow-800 font-medium">
                🔒 <strong>NÃO compartilhamos</strong> seus dados pessoais com terceiros para fins comerciais.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-3">
              Seus dados podem ser compartilhados apenas em casos específicos previstos em lei ou mediante ordem
              judicial.
            </p>
          </section>

          {/* 6. Armazenamento */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              6. Armazenamento e Segurança
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🏢 Infraestrutura:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Supabase</strong> - Plataforma certificada (SOC 2, ISO 27001)
                  </li>
                  <li>
                    • <strong>Servidores</strong> - Data centers seguros nos EUA/Europa
                  </li>
                  <li>
                    • <strong>Criptografia</strong> - Dados protegidos em trânsito e repouso
                  </li>
                  <li>
                    • <strong>Backups</strong> - Realizados automaticamente
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Prazo de armazenamento */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              7. Prazo de Armazenamento
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Seus dados serão mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados serão
              removidos em até <strong>30 dias</strong>, exceto quando a manutenção for obrigatória por lei.
            </p>
          </section>

          {/* 8. Seus direitos */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              8. Seus Direitos (LGPD)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium mb-2">📋 Acesso</h4>
                <p className="text-sm text-gray-600">Consultar seus dados pessoais</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium mb-2">✏️ Correção</h4>
                <p className="text-sm text-gray-600">Corrigir dados incompletos ou incorretos</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium mb-2">🗑️ Exclusão</h4>
                <p className="text-sm text-gray-600">Apagar seus dados (direito ao esquecimento)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium mb-2">📥 Portabilidade</h4>
                <p className="text-sm text-gray-600">Baixar seus dados em formato estruturado</p>
              </div>
            </div>
          </section>

          {/* 9. Contato */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              9. Contato e Exercício de Direitos
            </h2>
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Canal oficial LGPD:</span>
              </div>
              <p className="text-green-700">
                <strong>Email:</strong> lgpd@seuplanejamento.com
                <br />
                <strong>Prazo de resposta:</strong> Até 15 dias úteis
                <br />
                <strong>Responsável:</strong> Equipe de Privacidade
              </p>
            </div>
          </section>

          {/* 10. Alterações */}
          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#152638" }}>
              10. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Esta Política de Privacidade pode ser atualizada periodicamente. Alterações significativas serão
              comunicadas por email ou através de aviso no aplicativo.
            </p>
          </section>

          {/* Rodapé */}
          <div className="border-t pt-4 mt-6">
            <p className="text-sm text-gray-500 text-center">
              <strong>Controle Financeiro - Seu Planejamento</strong>
              <br />
              Política de Privacidade em conformidade com a LGPD (Lei 13.709/2018)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
