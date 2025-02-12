"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, UserPlus, Car, Phone, ChevronDown, ChevronUp, RefreshCcw, Trash2, Mail, MapPin, Pencil, User } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { useMask } from "@/hooks/useMask"

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
  const { maskCPF } = useMask()
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
    } finally {
      setVeiculoParaExcluir(null)
    }
  }

  const toggleExpand = (cpf: string) => {
    setExpandedClient(expandedClient === cpf ? null : cpf)
  }

  const handleVeiculoClick = (e: React.MouseEvent, placa: string) => {
    e.stopPropagation()
    fetchVeiculoDetalhes(placa)
  }

  const filteredClientes = clientes.filter(cliente => {
    // Validar se os campos existem antes de usar
    const nome = cliente.nome || ''
    const cpf = maskCPF(cliente.cpf || '') // Aplica máscara no CPF
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
    fetchClientes()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="container mx-auto p-4">
        {/* Header simplificado - removido os cards de estatísticas */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <PageHeader 
            title="Gestão de Clientes"
            description="Sistema integrado de gestão de clientes Porsche"
          />
        </motion.div>

        {/* Barra de pesquisa e botões */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, telefone ou placa..."
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => fetchClientes()}
              size="icon"
              className="h-12 w-12 bg-blue-500 hover:bg-blue-600 rounded-xl"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Link href="/cadastro">
              <Button 
                size="icon"
                className="h-12 w-12 bg-red-500 hover:bg-red-600 rounded-xl"
              >
                <UserPlus className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Lista de Clientes */}
        <div className="space-y-4 pb-20">
          {filteredClientes.map((cliente, index) => (
            <motion.div
              key={cliente.cpf}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleExpand(cliente.cpf)}
              className="cursor-pointer"
            >
              <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar e Info Principal */}
                    <div className="flex items-center gap-3 flex-1 min-w-0"> {/* Adicionado min-w-0 */}
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1"> {/* Garante que o texto quebre */}
                        <h3 className="text-base font-semibold truncate">{cliente.nome}</h3>
                        <p className="text-sm text-gray-500 truncate">CPF: {maskCPF(cliente.cpf)}</p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 flex-shrink-0"> {/* Adicionado flex-shrink-0 */}
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
                  </div>

                  {/* Informações Básicas e Botões de Ação */}
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">{cliente.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{cliente.placa.length} veículo(s)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/editar-cliente/${cliente.cpf}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClienteParaExcluir(cliente.cpf);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  {expandedClient === cliente.cpf && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t"
                    >
                      {/* Lista de Veículos */}
                      <div className="space-y-3">
                        {cliente.placa.map((placa) => (
                          <div key={placa} className="rounded-lg border bg-card">
                            <div className="flex items-center justify-between p-3">
                              <Button
                                variant="ghost"
                                className="flex-1 h-auto p-2 justify-start overflow-hidden"
                                onClick={(e) => handleVeiculoClick(e, placa)}
                              >
                                <div className="flex items-center gap-2 min-w-0 w-full"> {/* Ajustado para quebrar texto */}
                                  <Car className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate flex-1">{placa}</span>
                                  <span className="text-sm text-muted-foreground flex-shrink-0">
                                    {loadingFotos[placa] ? 'Carregando...' : 'Ver fotos'}
                                  </span>
                                </div>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 ml-2 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVeiculoParaExcluir(placa);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Grid de Fotos */}
                            {veiculoDetalhes[placa]?.fotos?.length > 0 && (
                              <div className="p-3 border-t">
                                <div className="grid grid-cols-3 gap-2">
                                  {veiculoDetalhes[placa].fotos.map((foto, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.1 }}
                                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(foto);
                                      }}
                                    >
                                      <Image
                                        src={foto}
                                        alt={`Foto ${idx + 1}`}
                                        fill
                                        className="object-cover transition-transform hover:scale-110"
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex justify-end gap-2 mt-4">
                        <Link href={`/cadastrar-veiculo?cpf=${cliente.cpf}`}>
                          <Button variant="outline" size="sm">
                            <Car className="h-4 w-4 mr-2" />
                            Adicionar Veículo
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modais */}
        <ImageModal
          isOpen={!!selectedImage}
          imageUrl={selectedImage || ''}
          onClose={() => setSelectedImage(null)}
          images={selectedImage ? veiculoDetalhes[selectedImage.split('/').pop()?.split('_')[0] || '']?.fotos || [] : []}
        />

        <AlertDialog open={!!clienteParaExcluir} onOpenChange={() => setClienteParaExcluir(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => clienteParaExcluir && handleExcluir(clienteParaExcluir)}
              >
                Excluir
              </AlertDialogAction>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!veiculoParaExcluir} onOpenChange={() => setVeiculoParaExcluir(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão do veículo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o veículo com placa {veiculoParaExcluir}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => veiculoParaExcluir && handleExcluirVeiculo(veiculoParaExcluir)}
              >
                Excluir
              </AlertDialogAction>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}