import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seu Planejamento - Controle Financeiro",
  description: "Aplicativo completo de controle financeiro pessoal com integração WhatsApp",
  keywords: ["finanças", "controle financeiro", "orçamento", "gastos", "receitas", "planejamento"],
  authors: [{ name: "Seu Planejamento" }],
  creator: "Seu Planejamento",
  publisher: "Seu Planejamento",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.json",
  themeColor: "#152638",
  colorScheme: "light",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Seu Planejamento",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://seu-planejamento.vercel.app",
    siteName: "Seu Planejamento",
    title: "Seu Planejamento - Controle Financeiro",
    description: "Controle suas finanças de forma simples e eficiente",
    images: [
      {
        url: "/app-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Seu Planejamento Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seu Planejamento - Controle Financeiro",
    description: "Controle suas finanças de forma simples e eficiente",
    images: ["/app-dashboard.png"],
  },
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#152638" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Seu Planejamento" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#152638" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className} suppressHydrationWarnings>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
