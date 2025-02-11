import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Porsche Auto",
  description: "Sistema de gestão automotiva especializado em Porsche",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={cn("min-h-screen antialiased bg-white", inter.className)}>
        <div className="relative min-h-screen">
          {children}
          <Footer />
          <Toaster position="top-right" richColors />
        </div>
      </body>
    </html>
  )
}