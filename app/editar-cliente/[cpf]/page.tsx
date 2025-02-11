"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car } from "lucide-react"
import Link from "next/link"
import { useMask } from "@/hooks/useMask"
import React from "react"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"
import { themeColors, layoutClasses } from "@/constants/styles"

interface ClienteCompleto {
  cliente: {
    nome: string
    cpf: string
    telefone: string
    email: string
    endereco: string
  }
  veiculos: Array<{
    placa: string
    fotos: string[]
  }>
}

export default function EditarClientePage({ params }: { params: Promise<{ cpf: string }> }) {
  const resolvedParams = React.use(params)
  
  const router = useRouter()
  const { maskCPF, maskPhone, maskPlaca } = useMask()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<ClienteCompleto | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: ''
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[][]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          action: 'buscar_cliente_completo',
          body: { cpf: resolvedParams.cpf }
        }

        const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })

        const result = await response.json()

        if (result.message) {
          setData(result.message)
          setFormData({
            nome: result.message.cliente.nome,
            cpf: result.message.cliente.cpf,
            telefone: result.message.cliente.telefone,
            email: result.message.cliente.email || '',
            endereco: result.message.cliente.endereco || ''
          })
        }
      } catch (error) {
        // Error handling without console.log
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.cpf])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        action: 'atualizar_cliente',
        body: {
          cliente: {
            nome: formData.nome,
            cpf: formData.cpf,
            telefone: formData.telefone,
            email: formData.email,
            endereco: formData.endereco
          },
          cpf_antigo: resolvedParams.cpf // Para identificar o cliente a ser atualizado
        }
      }

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (result.message == "Cliente atualizado com sucesso") {
        router.push('/buscar-cliente')
      } else {
        console.error('Erro ao atualizar cliente:', result)
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          Cliente não encontrado
          <Link href="/buscar-cliente">
            <Button className="mt-4">Voltar</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={layoutClasses.pageWrapper}>
      <div className={layoutClasses.backgroundEffects} />
      
      <div className={layoutClasses.container}>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/buscar-cliente">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader 
            title="Editar Cliente"
            description={`Editando dados de ${data.cliente.nome}`}
          />
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          <Card className={themeColors.cards.default}>
            <h2 className="text-xl font-semibold mb-6">Dados do Cliente</h2>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input 
                  id="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          <Card className={themeColors.cards.default}>
            <h2 className="text-xl font-semibold mb-6">Veículos</h2>
            <div className="grid gap-6">
              {data?.veiculos.map((veiculo, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      <span className="font-medium">Placa: {veiculo.placa}</span>
                    </div>
                  </div>

                  {/* Grid de fotos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {veiculo.fotos.map((foto, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedImage(foto)}
                      >
                        <Image
                          src={foto}
                          alt={`Foto ${idx + 1} do veículo ${veiculo.placa}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline"
              className="hover:bg-gray-50"
              onClick={() => router.push('/buscar-cliente')}
            >
              Cancelar
            </Button>
            <Button 
              className={themeColors.buttons.primary}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de imagem */}
      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  )
}
