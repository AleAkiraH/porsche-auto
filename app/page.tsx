"use client"

import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 md:ml-64">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"
            alt="Porsche Logo"
            width={200}
            height={100}
            className="mb-8"
          />
          <h1 className="mb-4 text-4xl font-bold">Bem-vindo à Porsche Service</h1>
          <p className="mb-8 max-w-2xl text-xl">
            Oferecemos serviços especializados para o seu Porsche. Entre em contato conosco para agendar uma consulta ou
            obter mais informações.
          </p>
          <Link
            href="https://wa.me/5511943099908"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-6 w-6" />
            Contate-nos via WhatsApp
          </Link>
        </div>
      </main>
    </div>
  )
}

