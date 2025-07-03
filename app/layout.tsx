import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Seu Planejamento - Controle Financeiro Inteligente",
  description: "Controle suas finanças de forma inteligente com IA, importação automática e relatórios avançados",
  keywords: "controle financeiro, planejamento, orçamento, finanças pessoais, IA, relatórios",
  authors: [{ name: "Seu Planejamento" }],
  creator: "Seu Planejamento",
  publisher: "Seu Planejamento",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Seu Planejamento - Controle Financeiro Inteligente",
    description: "Controle suas finanças de forma inteligente com IA, importação automática e relatórios avançados",
    url: "/",
    siteName: "Seu Planejamento",
    images: [
      {
        url: "/app-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Dashboard do Seu Planejamento",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seu Planejamento - Controle Financeiro Inteligente",
    description: "Controle suas finanças de forma inteligente com IA",
    images: ["/app-dashboard.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-seu-planejamento.png",
    shortcut: "/logo-seu-planejamento.png",
    apple: "/logo-seu-planejamento.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Seu Planejamento",
  },
  verification: {
    google: "google-site-verification-code",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#DDC067" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Seu Planejamento" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#152638" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
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
