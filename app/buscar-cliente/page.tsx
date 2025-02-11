"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, UserPlus, Car, Phone, ChevronDown, ChevronUp, RefreshCcw, Trash2, Mail, MapPin, Pencil } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

interface Cliente {
  nome: string
  cpf: string
  telefone: string
  email?: string
  endereco?: string
  placa: string[]
  fotos?: string[]
}

interface VeiculoDetalhes {
  placa: string
  fotos: string[]
}

export default function BuscarClientePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [veiculoDetalhes, setVeiculoDetalhes] = useState<Record<string, VeiculoDetalhes>>({})
  const [loadingFotos, setLoadingFotos] = useState<Record<string, boolean>>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null)
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<string | null>(null)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'buscar_clientes_e_veiculos',
          body: {}  // Mesmo vazio, mantemos o campo body
        })
      })

      const data = await response.json()
      
      if (data && data.message) {
        setClientes(data.message)
      } else if (data && Array.isArray(data)) {
        setClientes(data)
      } else {
        setClientes([])
      }
    } catch (error) {
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchVeiculoDetalhes = async (placa: string) => {
    if (!placa || veiculoDetalhes[placa]) {
      return
    }

    setLoadingFotos(prev => ({ ...prev, [placa]: true }))
    try {
      const payload = {
        action: 'buscar_veiculo',
        body: { placa: placa }
      }

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data && data.fotos) {
        setVeiculoDetalhes(prev => ({
          ...prev,
          [placa]: {
            placa,
            fotos: data.fotos
          }
        }))
      } else {
        setVeiculoDetalhes(prev => ({
          ...prev,
          [placa]: {
            placa,
            fotos: []
          }
        }))
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setLoadingFotos(prev => ({ ...prev, [placa]: false }))
    }
  }

  const handleExcluir = async (cpf: string) => {
    try {
      const payload = {
        action: 'excluir_cliente',
        body: { cpf: cpf }
      }

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.message === "Cliente excluído com sucesso") {
        fetchClientes()
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setClienteParaExcluir(null)
    }
  }

  const handleExcluirVeiculo = async (placa: string) => {
    try {
      const payload = {
        action: 'excluir_veiculo',
        body: {
          placa: placa
        }
      }

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (data.message === "Veículo excluído com sucesso") {
        // Atualiza a lista de clientes após excluir o veículo
        fetchClientes()
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error)
    } finally {
      setVeiculoParaExcluir(null)
    }
  }

  const toggleExpand = (cpf: string) => {
    setExpandedClient(expandedClient === cpf ? null : cpf)
  }

  const handleVeiculoClick = (e: React.MouseEvent, placa: string) => {
    e.stopPropagation()
    console.log('🚗 Buscando veículo específico:', placa)
    fetchVeiculoDetalhes(placa)
  }

  const filteredClientes = clientes.filter(cliente => {
    // Validar se os campos existem antes de usar
    const nome = cliente.nome || ''
    const cpf = cliente.cpf || ''
    const telefone = cliente.telefone || ''
    const placas = cliente.placa || [] // Array de placas do cliente
    const termoBusca = busca.toLowerCase()

    // Verifica se o termo de busca corresponde a alguma placa
    const temPlacaCorrespondente = placas.some(placa => 
      placa.toLowerCase().includes(termoBusca)
    )

    return nome.toLowerCase().includes(termoBusca) ||
      cpf.includes(termoBusca) ||
      telefone.includes(termoBusca) ||
      temPlacaCorrespondente // Adiciona a verificação de placas
  })

  useEffect(() => {
    console.log('0. Componente montado, iniciando fetch...')
    fetchClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="container mx-auto p-3">
        <PageHeader 
          title="Clientes"
          className="mb-4"
        />

        {/* Barra de pesquisa e botões */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-10 h-12 text-base border-gray-200"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              onClick={() => fetchClientes()}
              size="icon"
              className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Link href="/cadastro">
              <Button size="icon" className="h-10 w-10 bg-red-500 hover:bg-red-600">
                <UserPlus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="space-y-3 pb-20">
          {filteredClientes.map((cliente, index) => (
            <motion.div
              key={cliente.cpf}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleExpand(cliente.cpf)}
              className="cursor-pointer"
            >
              <Card className="bg-white p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{cliente.nome}</h3>
                    <p className="text-sm text-gray-500">CPF: {cliente.cpf}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cliente.cpf);
                    }}
                  >
                    {expandedClient === cliente.cpf ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Informações básicas sempre visíveis */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{cliente.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>{cliente.placa.length} veículo(s)</span>
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {expandedClient === cliente.cpf && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pt-3 border-t"
                  >
                    {/* ...resto do conteúdo expandido... */}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}