"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, UserPlus, Search, Car, FileText, MessageCircle, Settings, LogOut, Menu, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ThemeSelector } from "./theme-selector"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    clientes: false,
    veiculos: false,
    orcamentos: false
  }) 

  const toggleMenu = () => setIsOpen(!isOpen)

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Função para fechar o menu quando a rota muda
  useEffect(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      {/* Botão para abrir/fechar o menu */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-full bg-primary p-2 text-white shadow-lg transition-all hover:bg-primary/80 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 overflow-y-auto bg-primary text-primary-foreground transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col px-3 py-4">
          {/* Logo e Contato */}
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

          {/* Menu Items */}
          <nav className="space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10",
                pathname === "/" ? "bg-white/10" : ""
              )}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>

            {/* Clientes Section */}
            <div>
              <button 
                onClick={() => toggleSection("clientes")} 
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <span className="flex items-center">
                  <UserPlus className="mr-3 h-5 w-5" />
                  Clientes
                </span>
                {openSections.clientes ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {openSections.clientes && (
                <div className="ml-6 space-y-1">
                  <Link href="/cadastrar-cliente" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    Cadastrar Cliente
                  </Link>
                  <Link href="/buscar-cliente" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    Buscar Cliente
                  </Link>
                </div>
              )}
            </div>

            {/* Veículos */}
            <div>
              <button 
                onClick={() => toggleSection("veiculos")} 
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <span className="flex items-center">
                  <Car className="mr-3 h-5 w-5" />
                  Veículos
                </span>
                {openSections.veiculos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {openSections.veiculos && (
                <div className="ml-6 space-y-1">
                  <Link href="/cadastrar-veiculo" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    Cadastrar Veículo
                  </Link>
                </div>
              )}
            </div>

            {/* Orçamentos */}
            <div>
              <button 
                onClick={() => toggleSection("orcamentos")} 
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              >
                <span className="flex items-center">
                  <FileText className="mr-3 h-5 w-5" />
                  Orçamentos
                </span>
                {openSections.orcamentos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {openSections.orcamentos && (
                <div className="ml-6 space-y-1">
                  <Link href="/cadastrar-orcamento" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    Cadastrar Orçamento
                  </Link>
                  <Link href="/buscar-orcamento" onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10">
                    Buscar Orçamento
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Settings and Logout */}
          <div className="mt-auto space-y-2">
            <div className="px-3 py-2">
              <ThemeSelector />
            </div>
            <Link
              href="/configuracoes"
              onClick={() => setIsOpen(false)}
              className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
            >
              <Settings className="mr-3 h-5 w-5" />
              Configurações
            </Link>
            <Link
              href="/sair"
              onClick={() => setIsOpen(false)}
              className="flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
