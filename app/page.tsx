"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Users, ClipboardList, Wrench } from "lucide-react"
import { motion } from "framer-motion"

export default function HomePage() {
  const menuItems = [
    { 
      href: '/buscar-cliente', 
      label: 'Clientes', 
      icon: <Users className="h-8 w-8" />,
      color: 'from-sky-400 to-blue-500',
      glowColor: 'blue',
      delay: 0.2
    },
    { 
      href: '/buscar-orcamento', 
      label: 'Orçamentos', 
      icon: <ClipboardList className="h-8 w-8" />,
      color: 'from-emerald-400 to-green-500',
      glowColor: 'emerald',
      delay: 0.4
    },
    { 
      href: '/cadastrar-servico', 
      label: 'Serviços', 
      icon: <Wrench className="h-8 w-8" />,
      color: 'from-rose-400 to-red-500',
      glowColor: 'rose',
      delay: 0.6
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Efeitos de fundo mais sutis */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/50 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-red-100/50 to-transparent blur-3xl" />
      </div>
      
      <main className="container relative mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"
                alt="Porsche Logo"
                width={240}
                height={120}
                className="rounded-lg"
                priority
              />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full">
            {menuItems.map((item) => (
              <motion.div
                key={item.href}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: item.delay, duration: 0.5 }}
              >
                <Link href={item.href} className="group block">
                  <Card className={`
                    p-8 h-full bg-gradient-to-br ${item.color}
                    hover:shadow-2xl hover:shadow-${item.glowColor}-500/50
                    transition-all duration-500 ease-out
                    transform hover:-translate-y-2 group-hover:scale-[1.02]
                    border border-white/10 text-white relative overflow-hidden
                    backdrop-blur-sm bg-opacity-90
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-white/20 rounded-full transform group-hover:scale-110 transition-transform duration-500">
                        {item.icon}
                      </div>
                      <span className="text-xl font-medium tracking-wide">
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

