"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label" // Adicionando import do Label
import { Search, PlusCircle, ChevronDown, ChevronUp, RefreshCcw, Trash2, Pencil, FileText, Car, User, Calendar, Camera, Printer } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { formatarMoeda, logAPI } from "@/lib/utils"
import { generatePDF } from '@/components/pdf/orcamento-pdf';
import { toast } from 'sonner';
import { Footer } from "@/components/ui/footer"

interface Orcamento {
  _id: string;
  placa: string;
  descricao: string;
  previsaoEntrega: string;
  valor: number;
  fotos: string[];
  status: 'pendente' | 'aprovado' | 'reprovado';
  dataHora: string;
}

export default function BuscarOrcamentoPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)
  const [expandedOrcamento, setExpandedOrcamento] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [orcamentoParaExcluir, setOrcamentoParaExcluir] = useState<string | null>(null)
  const [loadingFotos, setLoadingFotos] = useState<Record<string, boolean>>({})
  const [showThumbnails, setShowThumbnails] = useState<Record<string, boolean>>({})
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const fetchOrcamentos = async () => {
    try {
      setLoading(true);
      logAPI('Buscando orçamentos', 'Iniciando busca');

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buscar_orcamentos',
          body: {}
        })
      });

      const data = await response.json();
      logAPI('Resposta da busca', data);

      if (data.message && Array.isArray(data.message)) {
        // Ordenar os orçamentos do mais recente para o mais antigo
        const orcamentosOrdenados = data.message.sort((a, b) => {
          return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
        });

        logAPI('Orçamentos ordenados', `Total: ${orcamentosOrdenados.length}`);
        setOrcamentos(orcamentosOrdenados);
      } else {
        logAPI('Aviso', 'Nenhum orçamento encontrado ou formato inválido');
        setOrcamentos([]);
      }
    } catch (error) {
      logAPI('Erro', `Falha ao buscar orçamentos: ${error}`);
      setOrcamentos([]);
    } finally {
      setLoading(false);
    }
  }

  const handleExcluir = async (id: string) => {
    try {
      logAPI('Excluindo orçamento', `ID: ${id}`);
      
      // Format the payload - ensure the ID is a clean string
      const formattedId = id.toString().trim();
      
      if (!formattedId) {
        throw new Error('ID inválido');
      }

      const payload = {
        action: 'excluir_orcamento',
        body: { 
          id: formattedId 
        }
      };
      
      logAPI('Payload de exclusão', payload);

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      logAPI('Resposta da exclusão', data);

      if (data.message === "Orçamento excluído com sucesso") {
        logAPI('Sucesso', 'Orçamento excluído com sucesso');
        await fetchOrcamentos(); // Refresh list after successful deletion
      } else {
        throw new Error(data.message || 'Erro desconhecido ao excluir');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logAPI('Erro', `Erro ao excluir orçamento: ${errorMessage}`);
    } finally {
      setOrcamentoParaExcluir(null);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedOrcamento(expandedOrcamento === id ? null : id)
  }

  const handleFotosClick = (e: React.MouseEvent, orcamento: Orcamento) => {
    e.stopPropagation()
    if (orcamento.fotos.length > 0) {
      setSelectedImage(orcamento.fotos[0])
    }
  }

  const handleGerarPDF = async (orcamento: Orcamento) => {
    const toastId = toast.loading('Gerando PDF...');
    
    try {
      const pdf = await generatePDF(orcamento);
      const dataFormatada = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const fileName = `orcamento-${orcamento.placa}-${dataFormatada}.pdf`;
      
      pdf.save(fileName);
      toast.success('PDF gerado com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF', { id: toastId });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'atualizar_orcamento',
          body: {
            id: id,
            status: newStatus
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      // Atualizar a lista de orçamentos
      fetchOrcamentos();

    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredOrcamentos = Array.isArray(orcamentos) ? orcamentos.filter(orcamento => {
    const termoBusca = busca.toLowerCase();
    const matchBusca = orcamento.placa.toLowerCase().includes(termoBusca) ||
                     orcamento.descricao.toLowerCase().includes(termoBusca);
  
    // Adiciona filtro por status
    const matchStatus = statusFiltro === 'todos' || orcamento.status === statusFiltro;
  
    return matchBusca && matchStatus;
  }).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()) : [];

  useEffect(() => {
    fetchOrcamentos()
  }, [])

  // Status colors
  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800",
    aprovado: "bg-green-100 text-green-800",
    reprovado: "bg-red-100 text-red-800"
  }

  // Atualizar a ordem e estilização dos statusOptions
  const statusOptions = [
    { 
      value: 'pendente', 
      label: 'Pendente',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white' 
    },
    { 
      value: 'aprovado', 
      label: 'Aprovado',
      className: 'bg-green-500 hover:bg-green-600 text-white'
    },
    { 
      value: 'reprovado', 
      label: 'Reprovado',
      className: 'bg-red-500 hover:bg-red-600 text-white'
    }
  ];

  // Função auxiliar para formatar data (ajustada para considerar fuso horário)
  const formatarData = (data: string) => {
    const date = new Date(data);
    // Adiciona o fuso horário local à data
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="container mx-auto p-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <PageHeader 
            title="Gerenciamento de Orçamentos"
            description="Sistema integrado de orçamentos Porsche"
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
              placeholder="Buscar por cliente, CPF ou placa..."
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchOrcamentos}
              size="icon"
              className="h-12 w-12 bg-blue-500 hover:bg-blue-600 rounded-xl"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Link href="/cadastrar-orcamento">
              <Button 
                size="icon"
                className="h-12 w-12 bg-red-500 hover:bg-red-600 rounded-xl"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Botões de filtro com tamanho ainda mais reduzido */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          <Button
            variant="default"
            onClick={() => setStatusFiltro('todos')}
            className="h-7 px-2.5 text-xs rounded-xl bg-gray-900 text-white hover:bg-gray-800"
          >
            Todos
          </Button>
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant="default"
              onClick={() => setStatusFiltro(option.value)}
              className={`${option.className} h-7 px-2.5 text-xs rounded-xl`}
            >
              {option.label}
            </Button>
          ))}
        </motion.div>

        {/* Lista de Orçamentos */}
        <div className="space-y-4 pb-20">
          {filteredOrcamentos.map((orcamento, index) => (
            <motion.div
              key={orcamento._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleExpand(orcamento._id)}
              className="cursor-pointer"
            >
              <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                <div className="p-4">
                  {/* Cabeçalho do Card - Versão Compacta */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          {orcamento.placa}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Entrada: {formatarData(orcamento.dataHora)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Previsão: {formatarData(orcamento.previsaoEntrega)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(orcamento._id)
                      }}
                    >
                      {expandedOrcamento === orcamento._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Conteúdo Expandido */}
                  {expandedOrcamento === orcamento._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t"
                    >
                      {/* Status e Valor */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-500">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                            statusColors[orcamento.status]
                          }`}>
                            {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Valor:</span>
                          <span className="ml-2 font-semibold">
                            {formatarMoeda(orcamento.valor)}
                          </span>
                        </div>
                      </div>

                      {/* Descrição com quebra de linha automática */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium">Descrição:</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <pre className="whitespace-pre-wrap break-words font-sans text-sm w-full">
                            {orcamento.descricao}
                          </pre>
                        </div>
                      </div>

                      {/* Fotos com miniaturas */}
                      {orcamento.fotos.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowThumbnails(prev => ({
                                ...prev,
                                [orcamento._id]: !prev[orcamento._id]
                              }));
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              <span>Visualizar fotos</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {orcamento.fotos.length} foto{orcamento.fotos.length !== 1 ? 's' : ''}
                            </span>
                          </Button>

                          {/* Grid de Miniaturas */}
                          {showThumbnails[orcamento._id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              {orcamento.fotos.map((foto, idx) => (
                                <div 
                                  key={idx}
                                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(foto);
                                  }}
                                >
                                  <Image
                                    src={foto}
                                    alt={`Foto ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 25vw, 20vw"
                                  />
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="grid gap-2 mt-4">
                        <Label>Status do Orçamento</Label>
                        <div className="flex gap-2">
                          {statusOptions.map((option) => (
                            <Button
                              key={option.value}
                              variant="default"
                              className={option.className}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleUpdateStatus(orcamento._id, option.value);
                              }}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarPDF(orcamento);
                          }}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Gerar PDF
                        </Button>
                        <Link href={`/editar-orcamento/${orcamento._id}`} onClick={(e) => {
                          e.stopPropagation();
                          // Store the data in sessionStorage before navigation
                          sessionStorage.setItem('orcamentoData', JSON.stringify(orcamento));
                        }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOrcamentoParaExcluir(orcamento._id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
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
          images={selectedImage ? orcamentos.find(o => o.fotos.includes(selectedImage))?.fotos || [] : []}
        />

        <AlertDialog open={!!orcamentoParaExcluir} onOpenChange={() => setOrcamentoParaExcluir(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4">
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => orcamentoParaExcluir && handleExcluir(orcamentoParaExcluir)}
              >
                Excluir
              </AlertDialogAction>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </div>
  )
}

