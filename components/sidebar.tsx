"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, UserPlus, Search, Car, MessageCircle, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeSelector } from "./theme-selector"

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cadastrar-cliente", label: "Cadastrar Cliente", icon: UserPlus },
    { href: "/buscar-cliente", label: "Buscar Cliente", icon: Search },
    { href: "/cadastrar-veiculo", label: "Cadastrar Veículo", icon: Car },
  ]

  const bottomMenuItems = [
    { href: "/configuracoes", label: "Configurações", icon: Settings },
    { href: "/sair", label: "Sair", icon: LogOut },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary text-primary-foreground">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-6 flex flex-col items-center px-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"
            alt="Porsche Logo"
            width={150}
            height={75}
            className="mb-4"
          />
          <Link
            href="https://wa.me/5511943099908"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            <MessageCircle className="h-4 w-4" />
            (11) 94309-9908
          </Link>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10",
                  pathname === item.href ? "bg-white/10" : "",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto space-y-1">
          <div className="px-3 py-2">
            <ThemeSelector />
          </div>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

