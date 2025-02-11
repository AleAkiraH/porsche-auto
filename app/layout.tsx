import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/ui/footer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

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
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
            <Link href="/">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full shadow-md bg-white h-12 w-12"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  )
}