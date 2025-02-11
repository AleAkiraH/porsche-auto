"use client"

// Replace react-input-mask import with our custom hook
import { useMask } from "@/hooks/useMask"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'

interface FormData {
  // Dados do Cliente
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
  // Dados do Veículo
  placa: string
  fotos: File[]
}

const MAX_IMAGE_SIZE = 800; // Tamanho máximo em pixels

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = image.width;
        let height = image.height;
        if (width > height && width > MAX_IMAGE_SIZE) {
          height *= MAX_IMAGE_SIZE / width;
          width = MAX_IMAGE_SIZE;
        } else if (height > MAX_IMAGE_SIZE) {
          width *= MAX_IMAGE_SIZE / height;
          height = MAX_IMAGE_SIZE;
        }

        // Criar canvas e redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0, width, height);

        // Converter para base64 com qualidade reduzida
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      image.onerror = reject;
      image.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Função para validar placa
const validatePlaca = (placa: string) => {
  // Padrão antigo: 3 letras e 4 números
  const oldPattern = /^[A-Z]{3}[0-9]{4}$/
  // Padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números
  const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/
  
  const cleanPlaca = placa.replace(/[^A-Z0-9]/g, '').toUpperCase()
  return oldPattern.test(cleanPlaca) || mercosulPattern.test(cleanPlaca)
}

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    placa: '',
    fotos: []
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { maskCPF, maskPhone, maskPlaca } = useMask()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    switch (id) {
      case 'cpf':
        formattedValue = maskCPF(value)
        break
      case 'telefone':
        formattedValue = maskPhone(value)
        break
      case 'placa':
        formattedValue = maskPlaca(value)
        break
      default:
        formattedValue = value
    }

    setFormData(prev => ({ ...prev, [id]: formattedValue }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...files] }))
    
    // Criar URLs para preview
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
    if (!formData.nome || !formData.cpf || !formData.telefone) {
      // Você pode adicionar um toast ou mensagem de erro aqui
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.placa) {
      // Você pode adicionar um toast ou mensagem de erro aqui
      return false
    }
    const isValidPlaca = validatePlaca(formData.placa)
    if (!isValidPlaca) {
      // Adicionar feedback visual aqui
      return false
    }
    return true
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      return
    }
    if (step === 2 && !validateStep2()) {
      return
    }
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Processar imagens com redimensionamento
      const fotosBase64 = await Promise.all(
        formData.fotos.map(file => resizeImage(file))
      )

      const payload = {
        action: 'cadastrar_cliente_e_veiculo',
        body: {
          nome: formData.nome,
          cpf: formData.cpf,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          placa: formData.placa,
          fotos: fotosBase64
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
      const message = data.message

      if (message.mensagem === 'Cadastro realizado com sucesso!') {
        router.push('/buscar-cliente')
      }
      // Em caso de erro, você pode adicionar um toast ou alert aqui
      
    } catch (error) {
      console.error('Erro ao processar cadastro:', error)
    } finally {
      setLoading(false)
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
        <div className="grid gap-6">
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
        </div>

        <div className="flex justify-end mt-8">
          <Button 
            onClick={nextStep}
            className="bg-red-600 hover:bg-red-700"
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
        <h2 className="text-xl font-semibold mb-6">Dados do Veículo</h2>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="placa" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Placa do Veículo *
            </Label>
            <Input
              id="placa"
              value={formData.placa}
              onChange={handleChange}
              className="h-12 uppercase"
              maxLength={8}
              required
            />
          </div>

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
        </div>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            onClick={nextStep}
            className="bg-red-600 hover:bg-red-700"
          >
            Próximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )

  const renderStepThree = () => (
    <div className="space-y-6">
      <motion.div {...slideAnimation}>
        <h2 className="text-xl font-semibold mb-6">Confirmação</h2>
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <User className="h-4 w-4" />
              Dados do Cliente
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Nome</dt>
                <dd>{formData.nome}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">CPF</dt>
                <dd>{formData.cpf}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Telefone</dt>
                <dd>{formData.telefone}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd>{formData.email || '-'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-muted-foreground">Endereço</dt>
                <dd>{formData.endereco || '-'}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <Car className="h-4 w-4" />
              Dados do Veículo
            </h3>
            <dl className="grid gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Placa</dt>
                <dd>{formData.placa}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Fotos</dt>
                <dd className="grid grid-cols-4 gap-2 mt-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={!formData.nome || !formData.cpf || !formData.telefone || !formData.placa}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {loading ? 'Cadastrando...' : 'Concluir Cadastro'}
          </Button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50 dark:from-background dark:to-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/buscar-cliente">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader 
            title="Novo Cadastro"
            description="Cadastro de cliente e veículo"
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
            {step === 3 && renderStepThree()}
          </div>
        </Card>
      </div>
    </div>
  )
}
