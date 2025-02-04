import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Porsche Auto Elétrico",
  description: "Sistema de gestão automotiva especializado em Porsche",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
          <Sidebar />
          <main className="flex-1 w-full md:pl-64 min-h-screen">
            <div className="container mx-auto p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}