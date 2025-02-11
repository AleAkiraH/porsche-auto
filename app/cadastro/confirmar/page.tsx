"use client"

import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, User } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ConfirmarPage() {
  const searchParams = useSearchParams()
  
  const nome = searchParams.get('nome')
  const cpf = searchParams.get('cpf')
  const telefone = searchParams.get('telefone')
  const email = searchParams.get('email')
  const endereco = searchParams.get('endereco')

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md w-full mx-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Confirmar Dados</h2>
          <div className="grid gap-4">
            {nome && (
              <div className="flex items-start gap-2 max-w-full">
                <User className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-600 break-words w-full inline-block">
                    {nome}
                  </span>
                </div>
              </div>
            )}

            {telefone && (
              <div className="flex items-start gap-2 max-w-full">
                <Phone className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-600 break-words w-full inline-block">
                    {telefone}
                  </span>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-2 max-w-full">
                <Mail className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-600 break-words w-full inline-block">
                    {email}
                  </span>
                </div>
              </div>
            )}

            {endereco && (
              <div className="flex items-start gap-2 max-w-full">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-600 break-words w-full inline-block">
                    {endereco}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
