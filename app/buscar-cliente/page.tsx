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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Efeitos de fundo mais sutis */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100/50 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-red-100/50 to-transparent blur-3xl" />
      </div>

      <div className="container relative mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <PageHeader 
            title={
              <span className="text-gradient">
                Gerenciamento de Clientes
              </span>
            }
            description="Sistema integrado de gestão de clientes Porsche"
          />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            <Card className="p-3 sm:p-4 bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-sm sm:text-lg font-semibold">Total Clientes</h3>
              <p className="text-xl sm:text-3xl font-bold">{clientes.length}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-sm sm:text-lg font-semibold">Clientes Ativos</h3>
              <p className="text-xl sm:text-3xl font-bold">
                {clientes.filter(c => c.placa.length > 0).length}
              </p>
            </Card>
            <Card className="col-span-2 sm:col-span-1 p-3 sm:p-4 bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-sm sm:text-lg font-semibold">Total Veículos</h3>
              <p className="text-xl sm:text-3xl font-bold">
                {clientes.reduce((acc, curr) => acc + curr.placa.length, 0)}
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Search Bar */}
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
              className="pl-12 h-12 text-lg bg-white border-gray-200 focus:ring-2 focus:ring-blue-500/50 shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-4">
            <Button 
              onClick={() => fetchClientes()}
              className="h-12 px-6 bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCcw className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Link href="/cadastro" className="flex-shrink-0">
              <Button className="h-12 px-6 bg-gradient-to-r from-rose-400 to-red-500 text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-200">
                <UserPlus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Novo Cliente</span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Client Cards */}
        <div className="grid gap-4 pb-20">
          {filteredClientes.map((cliente, index) => (
            <motion.div
              key={cliente.cpf}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleExpand(cliente.cpf)}
              className="cursor-pointer"
            >
              <Card className="bg-white hover:shadow-lg transition-shadow duration-200 mb-4">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      {/* Cabeçalho com Nome e CPF */}
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-xl font-semibold truncate">{cliente.nome}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">CPF: {cliente.cpf}</p>
                        </div>
                      </div>
                      
                      {/* Grid com informações do cliente */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{cliente.telefone}</span>
                        </div>
                        
                        {cliente.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{cliente.email}</span>
                          </div>
                        )}
                        
                        {cliente.endereco && (
                          <div className="flex items-center gap-2 col-span-full">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{cliente.endereco}</span>
                          </div>
                        )}
                        
                        {cliente.placa.length > 0 && (
                          <div className="flex items-center gap-2 col-span-full">
                            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">
                              Veículos: {cliente.placa.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <Link href={`/editar-cliente/${cliente.cpf}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          setClienteParaExcluir(cliente.cpf)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        {expandedClient === cliente.cpf ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo expandido (fotos dos veículos) */}
                  {expandedClient === cliente.cpf && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 border-t pt-4"
                    >
                      <div className="grid gap-4">
                        {cliente.placa.map((placa) => (
                          <div key={placa} className="space-y-2">
                            <div className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                              <Button
                                variant="ghost"
                                className="flex-1 flex items-center justify-between"
                                onClick={(e) => handleVeiculoClick(e, placa)}
                              >
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  <span>Placa: {placa}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {loadingFotos[placa] ? 'Carregando...' : 'Clique para ver fotos'}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setVeiculoParaExcluir(placa)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {loadingFotos[placa] ? (
                              <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                              </div>
                            ) : veiculoDetalhes[placa]?.fotos?.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {veiculoDetalhes[placa].fotos.map((foto, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                                    onClick={() => setSelectedImage(foto)}
                                  >
                                    <div className="absolute inset-0 bg-gray-200 animate-pulse" /> {/* Loading placeholder */}
                                    <Image
                                      src={foto}
                                      alt={`Foto ${idx + 1} do veículo ${placa}`}
                                      fill
                                      className="object-cover transition-transform group-hover:scale-110 z-10"
                                      onError={(e) => {
                                        console.error(`Erro ao carregar imagem ${idx + 1}:`, foto)
                                        e.currentTarget.src = '/placeholder-car.jpg' // Adicione uma imagem de placeholder
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-20" />
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma foto disponível para este veículo
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-4 gap-2">
                        <Link href={`/cadastrar-veiculo?cpf=${cliente.cpf}`}>
                          <Button variant="outline" size="sm" className="h-9 w-9 sm:h-10 sm:w-auto">
                            <Car className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Adicionar Veículo</span>
                          </Button>
                        </Link>
                        <Link href={`/editar-cliente/${cliente.cpf}`}>
                          <Button variant="outline" size="sm" className="h-9 w-9 sm:h-10 sm:w-auto">
                            <UserPlus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Editar</span>
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

        {/* ...rest of your component (modals, etc)... */}
      </div>

      {/* Modal de imagem */}
      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />

      {/* Adicione o diálogo de confirmação no final do componente */}
      <AlertDialog open={!!clienteParaExcluir} onOpenChange={() => setClienteParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => clienteParaExcluir && handleExcluir(clienteParaExcluir)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Adicionar novo diálogo de confirmação para exclusão de veículo */}
      <AlertDialog 
        open={!!veiculoParaExcluir} 
        onOpenChange={() => setVeiculoParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão do veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo com placa {veiculoParaExcluir}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => veiculoParaExcluir && handleExcluirVeiculo(veiculoParaExcluir)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}