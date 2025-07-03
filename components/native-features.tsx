"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Share, Vibrate, Smartphone, Wifi, Battery, Bell, Download, CheckCircle } from "lucide-react"

interface NativeFeaturesProps {
  user: any
}

export default function NativeFeatures({ user }: NativeFeaturesProps) {
  const [isNative, setIsNative] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [networkStatus, setNetworkStatus] = useState<any>(null)
  const [batteryInfo, setBatteryInfo] = useState<any>(null)

  useEffect(() => {
    checkNativeCapabilities()
  }, [])

  const checkNativeCapabilities = async () => {
    // Verificar se está rodando como app nativo
    const isCapacitor = !!(window as any).Capacitor
    setIsNative(isCapacitor)

    if (isCapacitor) {
      try {
        // Importar plugins do Capacitor dinamicamente
        const { Device } = await import("@capacitor/device")
        const { Network } = await import("@capacitor/network")

        // Obter informações do dispositivo
        const deviceInfo = await Device.getInfo()
        setDeviceInfo(deviceInfo)

        // Obter status da rede
        const networkStatus = await Network.getStatus()
        setNetworkStatus(networkStatus)

        // Monitorar mudanças na rede
        Network.addListener("networkStatusChange", (status) => {
          setNetworkStatus(status)
        })

        // Obter informações da bateria (se disponível)
        if ("getBattery" in navigator) {
          const battery = await (navigator as any).getBattery()
          setBatteryInfo({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
          })
        }
      } catch (error) {
        console.error("Erro ao acessar recursos nativos:", error)
      }
    }
  }

  const handleTakePhoto = async () => {
    if (!isNative) {
      alert("Recurso disponível apenas no app nativo")
      return
    }

    try {
      const { Camera } = await import("@capacitor/camera")
      const { CameraResultType, CameraSource } = await import("@capacitor/camera")

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })

      console.log("Foto capturada:", image.dataUrl)
      // Aqui você processaria a imagem com OCR
      alert("Foto capturada com sucesso! (OCR seria processado aqui)")
    } catch (error) {
      console.error("Erro ao capturar foto:", error)
      alert("Erro ao acessar a câmera")
    }
  }

  const handleShare = async () => {
    try {
      if (isNative) {
        const { Share } = await import("@capacitor/share")
        await Share.share({
          title: "Meu Relatório Financeiro",
          text: "Confira meu controle financeiro no Seu Planejamento!",
          url: "https://seuplanejamento.app",
          dialogTitle: "Compartilhar Relatório",
        })
      } else {
        // Fallback para Web Share API
        if (navigator.share) {
          await navigator.share({
            title: "Meu Relatório Financeiro",
            text: "Confira meu controle financeiro no Seu Planejamento!",
            url: window.location.href,
          })
        } else {
          // Fallback para clipboard
          await navigator.clipboard.writeText(window.location.href)
          alert("Link copiado para a área de transferência!")
        }
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
    }
  }

  const handleVibrate = async () => {
    try {
      if (isNative) {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
        await Haptics.impact({ style: ImpactStyle.Medium })
      } else {
        // Fallback para Vibration API
        if ("vibrate" in navigator) {
          navigator.vibrate([100, 50, 100])
        } else {
          alert("Vibração não suportada neste dispositivo")
        }
      }
    } catch (error) {
      console.error("Erro na vibração:", error)
    }
  }

  const handleNotification = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission()

        if (permission === "granted") {
          new Notification("Seu Planejamento", {
            body: "Lembrete: Registre suas transações do dia!",
            icon: "/logo-seu-planejamento.png",
            badge: "/logo-seu-planejamento.png",
            tag: "daily-reminder",
          })
        }
      }
    } catch (error) {
      console.error("Erro na notificação:", error)
    }
  }

  const handleBackup = async () => {
    try {
      // Simular backup dos dados
      const backupData = {
        user: user?.email,
        timestamp: new Date().toISOString(),
        transactions: [], // Aqui viriam as transações reais
        settings: {},
      }

      if (isNative) {
        const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem")

        await Filesystem.writeFile({
          path: `backup-${Date.now()}.json`,
          data: JSON.stringify(backupData, null, 2),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        })

        alert("Backup salvo na pasta Documentos!")
      } else {
        // Fallback para download no navegador
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `backup-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Erro no backup:", error)
      alert("Erro ao criar backup")
    }
  }

  return (
    <div className="space-y-6">
      {/* Status do App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status do Aplicativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant={isNative ? "default" : "secondary"} className="mb-2">
                {isNative ? "App Nativo" : "Web App"}
              </Badge>
              <p className="text-xs text-gray-600">{isNative ? "Recursos completos" : "Recursos limitados"}</p>
            </div>

            {networkStatus && (
              <div className="text-center">
                <Badge variant={networkStatus.connected ? "default" : "destructive"} className="mb-2">
                  <Wifi className="h-3 w-3 mr-1" />
                  {networkStatus.connected ? "Online" : "Offline"}
                </Badge>
                <p className="text-xs text-gray-600">{networkStatus.connectionType || "Desconhecido"}</p>
              </div>
            )}

            {batteryInfo && (
              <div className="text-center">
                <Badge variant={batteryInfo.level > 20 ? "default" : "destructive"} className="mb-2">
                  <Battery className="h-3 w-3 mr-1" />
                  {batteryInfo.level}%
                </Badge>
                <p className="text-xs text-gray-600">{batteryInfo.charging ? "Carregando" : "Bateria"}</p>
              </div>
            )}

            {deviceInfo && (
              <div className="text-center">
                <Badge variant="outline" className="mb-2">
                  {deviceInfo.platform}
                </Badge>
                <p className="text-xs text-gray-600">{deviceInfo.model || "Dispositivo"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recursos Nativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Câmera e OCR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Câmera & OCR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Capture comprovantes e extraia dados automaticamente</p>
            <Button
              onClick={handleTakePhoto}
              className="w-full"
              style={{ backgroundColor: "#DDC067", color: "#152638" }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Fotografar Comprovante
            </Button>
          </CardContent>
        </Card>

        {/* Compartilhamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Compartilhamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Compartilhe relatórios e dados financeiros</p>
            <Button onClick={handleShare} className="w-full bg-transparent" variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Compartilhar Relatório
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Receba lembretes e alertas importantes</p>
            <Button onClick={handleNotification} className="w-full bg-transparent" variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Testar Notificação
            </Button>
          </CardContent>
        </Card>

        {/* Backup Local */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Salve seus dados localmente no dispositivo</p>
            <div className="flex gap-2">
              <Button onClick={handleBackup} className="flex-1 bg-transparent" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Backup
              </Button>
              <Button onClick={handleVibrate} variant="outline" className="px-3 bg-transparent">
                <Vibrate className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Dispositivo */}
      {deviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Plataforma</p>
                <p className="text-gray-600">{deviceInfo.platform}</p>
              </div>
              <div>
                <p className="font-medium">Modelo</p>
                <p className="text-gray-600">{deviceInfo.model || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium">Sistema</p>
                <p className="text-gray-600">{deviceInfo.operatingSystem}</p>
              </div>
              <div>
                <p className="font-medium">Versão</p>
                <p className="text-gray-600">{deviceInfo.osVersion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de Uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            Dicas para melhor experiência
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>App Nativo:</strong> Instale o app para acesso a todos os recursos
            </li>
            <li>
              • <strong>Permissões:</strong> Permita acesso à câmera e notificações
            </li>
            <li>
              • <strong>Backup:</strong> Faça backups regulares dos seus dados
            </li>
            <li>
              • <strong>Offline:</strong> Alguns recursos funcionam sem internet
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
