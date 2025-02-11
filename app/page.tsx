"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Users, ClipboardList, Wrench, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const menuItems = [
    { 
      href: '/buscar-cliente', 
      label: 'Clientes', 
      icon: <Users className="h-6 w-6" />,
      color: 'from-sky-400 to-blue-500',
      glowColor: 'blue',
      delay: 0.2
    },
    { 
      href: '/buscar-orcamento', 
      label: 'Orçamentos', 
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'from-emerald-400 to-green-500',
      glowColor: 'emerald',
      delay: 0.4
    },
    { 
      href: '/cadastrar-servico', 
      label: 'Serviços', 
      icon: <Wrench className="h-6 w-6" />,
      color: 'from-rose-400 to-red-500',
      glowColor: 'rose',
      delay: 0.6
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          {/* Logoff Button */}
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {}} 
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Logo ajustado - maior e mais alto */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-16 mt-[-100px]" // Aumentado margem negativa no topo e aumentado margin-bottom
          >
            <div className="rounded-full overflow-hidden w-48 h-48 bg-black shadow-xl"> {/* Aumentado de w-40/h-40 para w-48/h-48 */}
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"
                alt="Porsche Logo"
                width={192} // Aumentado de 160 para 192
                height={192} // Aumentado de 160 para 192
                className="object-contain p-4"
                priority
              />
            </div>
          </motion.div>
          
          {/* Menu Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
            {menuItems.map((item) => (
              <motion.div
                key={item.href}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: item.delay, duration: 0.5 }}
              >
                <Link href={item.href} className="group block">
                  <Card className={`
                    p-4 aspect-square bg-gradient-to-br ${item.color}
                    hover:shadow-lg hover:shadow-${item.glowColor}-500/30
                    transition-all duration-300 transform hover:-translate-y-1
                    border-none text-white relative rounded-xl
                  `}>
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                      <div className="p-3 bg-white/20 rounded-full">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

