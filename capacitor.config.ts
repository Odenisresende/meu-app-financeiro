import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.seuplanejamento.app",
  appName: "Seu Planejamento",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#152638",
      showSpinner: true,
      spinnerColor: "#DDC067",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#152638",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
    },
    Camera: {
      permissions: {
        camera: "Necessário para fotografar comprovantes",
        photos: "Necessário para selecionar imagens da galeria",
      },
    },
    Filesystem: {
      permissions: {
        publicStorage: "Necessário para salvar relatórios e backups",
      },
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
}

export default config
