"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  ArrowRight,
  Car,
  Camera
} from "lucide-react"
import Link from "next/link"
import { useMask } from "@/hooks/useMask"
import { motion } from "framer-motion"
import React from "react"
import Image from "next/image"

interface FormData {
  // Dados do Cliente
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
  // Dados do Veículo
  veiculos: Array<{
    placa: string
    fotos: string[]
  }>
}

export default function EditarClientePage({ params }: { params: { cpf: string } }) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const { maskCPF, maskPhone } = useMask()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    veiculos: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'buscar_cliente_completo',
            body: { cpf: resolvedParams.cpf }
          })
        })

        const result = await response.json()

        if (result.message) {
          setFormData({
            nome: result.message.cliente.nome,
            cpf: maskCPF(result.message.cliente.cpf),
            telefone: maskPhone(result.message.cliente.telefone),
            email: result.message.cliente.email || '',
            endereco: result.message.cliente.endereco || '',
            veiculos: result.message.veiculos || []
          })
        }
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.cpf])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    if (id === 'cpf') {
      formattedValue = maskCPF(value)
    } else if (id === 'telefone') {
      formattedValue = maskPhone(value)
    }

    setFormData(prev => ({
      ...prev,
      [id]: formattedValue
    }))
  }

  const validateStep1 = () => {
    return formData.nome && formData.cpf && formData.telefone
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      return
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'atualizar_cliente',
          body: {
            ...formData,
            cpf: formData.cpf.replace(/\D/g, ''),
            telefone: formData.telefone.replace(/\D/g, ''),
            cpf_antigo: resolvedParams.cpf
          }
        })
      })

      const result = await response.json()
      if (result.message === "Cliente atualizado com sucesso") {
        router.push('/buscar-cliente')
      }
    } catch (error) {
      // Error handling
    } finally {
      setSaving(false)
    }
  }

  const slideAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  }

  const renderStepOne = () => (
    <div className="grid gap-6">
      <motion.div {...slideAnimation}>
        <h2 className="text-xl font-semibold mb-6">Dados do Cliente</h2>
        {/* Form fields for client data */}
        <div className="grid gap-2">
          <Label htmlFor="nome" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome Completo *
          </Label>
          <Input 
            id="nome"
            value={formData.nome}
            onChange={handleChange}
            className="h-12"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className="h-12"
              maxLength={14}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone *
            </Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="h-12"
              maxLength={15}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-mail
          </Label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="h-12"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="endereco" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </Label>
          <Input 
            id="endereco"
            value={formData.endereco}
            onChange={handleChange}
            className="h-12"
          />
        </div>
        <div className="flex justify-end mt-8">
          <Button 
            onClick={nextStep}
            className="bg-red-600 hover:bg-red-700"
            disabled={!validateStep1()}
          >
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )

  const renderStepTwo = () => (
    <div className="grid gap-6">
      <motion.div {...slideAnimation}>
        <h2 className="text-xl font-semibold mb-6">Veículos Cadastrados</h2>
        <div className="space-y-4">
          {formData.veiculos.map((veiculo, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5" />
                <span className="font-medium">Placa: {veiculo.placa}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {veiculo.fotos.map((foto, idx) => (
                  <div key={idx} className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={foto}
                      alt={`Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
            disabled={saving}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </motion.div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/buscar-cliente">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader 
            title="Editar Cliente"
            description="Atualização de dados do cliente"
          />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center w-full max-w-xl">
            <div className={`flex-1 h-2 ${step >= 1 ? 'bg-red-600' : 'bg-gray-200'}`} />
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              1
            </div>
            <div className={`flex-1 h-2 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              2
            </div>
            <div className={`flex-1 h-2 ${step >= 3 ? 'bg-red-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <div className="p-6">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
          </div>
        </Card>
      </div>
    </div>
  )
}
