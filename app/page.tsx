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
      icon: <Users className="h-6 w-6" />,
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"
              alt="Porsche Logo"
              width={160}
              height={80}
              className="rounded-lg"
              priority
            />
          </motion.div>
          
          <div className="grid grid-cols-3 gap-2 w-full max-w-xl">
            {menuItems.map((item) => (
              <motion.div
                key={item.href}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: item.delay, duration: 0.5 }}
              >
                <Link href={item.href} className="group block">
                  <Card className={`
                    p-4 h-full bg-gradient-to-br ${item.color}
                    hover:shadow-lg hover:shadow-${item.glowColor}-500/30
                    transition-all duration-300
                    transform hover:-translate-y-1
                    border-none text-white relative
                  `}>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="p-2 bg-white/20 rounded-full">
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

