"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Car, 
  FileText,
  Calendar,
  Camera,
  ArrowRight,
  CheckCircle2,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { useMask } from "@/hooks/useMask"
import { Combobox } from "@/components/ui/combobox"

// Ajustar constantes de redimensionamento
const MAX_IMAGE_SIZE = 600 // Reduzido de 800 para 600
const MAX_COMPRESSION = 0.5 // Adicionado controle de compressão (50%)

// Função melhorada de redimensionamento
async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (readerEvent) => {
      const image = new Image()
      image.onload = () => {
        // Calcular novas dimensões
        let width = image.width
        let height = image.height
        
        // Redimensionar proporcionalmente se maior que MAX_IMAGE_SIZE
        if (width > height && width > MAX_IMAGE_SIZE) {
          height *= MAX_IMAGE_SIZE / width
          width = MAX_IMAGE_SIZE
        } else if (height > MAX_IMAGE_SIZE) {
          width *= MAX_IMAGE_SIZE / height
          height = MAX_IMAGE_SIZE
        }

        // Criar canvas e redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(image, 0, 0, width, height)

        // Converter para base64 com maior compressão
        const base64 = canvas.toDataURL('image/jpeg', MAX_COMPRESSION)
        resolve(base64)
      }
      image.onerror = reject
      image.src = readerEvent.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface FormData {
  placa: string
  descricao: string
  previsaoEntrega: string
  valor: string
  dataHora: string
  fotos: File[]
}

export default function CadastrarOrcamentoPage() {
  const router = useRouter()
  const { maskPlaca } = useMask()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    placa: '',
    descricao: '',
    previsaoEntrega: '',
    valor: '',
    dataHora: new Date().toISOString(),
    fotos: []
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [placasDisponiveis, setPlacasDisponiveis] = useState<Array<{value: string, label: string}>>([])

  const fetchPlacas = async () => {
    try {
      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buscar_clientes_e_veiculos',
          body: {}
        })
      });

      const data = await response.json();
      if (data.message) {
        // Extrair todas as placas dos clientes
        const placas = data.message.reduce((acc: string[], cliente: any) => {
          return [...acc, ...(cliente.placa || [])]
        }, []);

        // Formatar para o ComboBox
        setPlacasDisponiveis(placas.map(placa => ({
          value: placa,
          label: placa
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar placas:', error);
    }
  };

  useEffect(() => {
    fetchPlacas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    if (id === 'placa') {
      // Remove caracteres especiais e converte para maiúsculo
      formattedValue = maskPlaca(value);
    } else if (id === 'valor') {
      formattedValue = value.replace(/\D/g, '')
      formattedValue = (Number(formattedValue) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }

    setFormData(prev => ({ ...prev, [id]: formattedValue }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...files] }))
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep1 = () => {
    return formData.placa && formData.descricao && formData.previsaoEntrega && formData.valor
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.placa || !formData.descricao || 
        !formData.previsaoEntrega || !formData.valor || 
        formData.fotos.length === 0) {
      console.warn('❌ Campos obrigatórios faltando');
      return;
    }

    setLoading(true);
    try {
      // Process images
      const fotosProcessadas = await Promise.all(
        formData.fotos.map(resizeImage)
      );
      // Format payload
      const valorNumerico = Number(formData.valor.replace(/[^\d]/g, '')) / 100;
      const dataAtual = new Date().toISOString();

      const payload = {
        action: 'cadastrar_orcamento',
        body: {
          placa: formData.placa.trim().toUpperCase(),
          descricao: formData.descricao.trim(),
          previsaoEntrega: formData.previsaoEntrega,
          valor: valorNumerico,
          dataHora: dataAtual,
          fotos: fotosProcessadas
        }
      };

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data) {
        throw new Error('Resposta vazia da API');
      }
      
      if (data.message == "Orçamento cadastrado com sucesso!") {
        router.push('/buscar-orcamento');
      } else {
        throw new Error(data.message || 'Erro desconhecido ao cadastrar orçamento');
      }

    } catch (error) {
      console.error('💥 Erro ao processar cadastro:', error);
      // Aqui você pode adicionar um toast ou alert para o usuário
    } finally {
      setLoading(false);
    }
  }

  const renderStepOne = () => (
    <div className="grid gap-6">
      <motion.div {...slideAnimation}>
        <h2 className="text-xl font-semibold mb-6">Dados do Orçamento</h2>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="placa" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Placa do Veículo *
            </Label>
            <Combobox
              options={placasDisponiveis}
              value={formData.placa}
              onChange={(value) => setFormData(prev => ({ ...prev, placa: value }))}
              placeholder="Selecione a placa"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição do Serviço *
            </Label>
            <textarea 
              id="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="min-h-[100px] p-3 rounded-md border"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="previsaoEntrega" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Previsão de Entrega *
              </Label>
              <Input
                id="previsaoEntrega"
                type="date"
                value={formData.previsaoEntrega}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor *
              </Label>
              <Input
                id="valor"
                value={formData.valor}
                onChange={handleChange}
                className="h-12"
                required
                placeholder="R$ 0,00"
              />
            </div>
          </div>
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
        <h2 className="text-xl font-semibold mb-6">Fotos</h2>
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Fotos do Veículo
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                <img 
                  src={url} 
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(idx)}
                >
                  ×
                </Button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Camera className="h-8 w-8 text-gray-400" />
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Concluir Cadastro'}
          </Button>
        </div>
      </motion.div>
    </div>
  )

  const slideAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/buscar-orcamento">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader 
            title="Novo Orçamento"
            description="Cadastro de orçamento"
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