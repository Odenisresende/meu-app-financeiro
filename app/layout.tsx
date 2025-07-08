import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seu Planejamento - Controle Financeiro",
  description: "Aplicativo completo de controle financeiro pessoal",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/svg+xml",
      },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#152638",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#152638" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Seu Planejamento" />
      </head>
      <body className={inter.className} suppressHydrationWarnings>
        {children}
      </body>
    </html>
  )
}
