"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car, Camera } from "lucide-react"
import Link from "next/link"
import { useMask } from "@/hooks/useMask"
import { themeColors, layoutClasses } from "@/constants/styles"

interface FormData {
  placa: string
  cpfCliente: string
  fotos: File[]
}

const MAX_IMAGE_SIZE = 800

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
      if (readerEvent.target?.result) {
        image.src = readerEvent.target.result as string;
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CadastrarVeiculoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cpf = searchParams.get('cpf')
  const { maskPlaca } = useMask()
  
  const [formData, setFormData] = useState<FormData>({
    placa: '',
    cpfCliente: cpf || '',
    fotos: []
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    let formattedValue = value

    if (id === 'placa') {
      formattedValue = maskPlaca(value)
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

  const handleSubmit = async () => {
    if (!formData.placa || !formData.cpfCliente || formData.fotos.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const fotosProcessadas = await Promise.all(
        formData.fotos.map(async (file) => {
          try {
            const base64 = await resizeImage(file);
            return base64;
          } catch (error) {
            return null;
          }
        })
      );

      const fotosValidas = fotosProcessadas.filter((foto): foto is string => foto !== null);

      if (fotosValidas.length === 0) {
        return;
      }

      const payload = {
        action: 'cadastrar_veiculo',
        body: {
          placa: formData.placa,
          cpfCliente: formData.cpfCliente,
          fotos: fotosValidas
        }
      };

      const response = await fetch('https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.message === "Veículo cadastrado com sucesso!") {
        router.push('/buscar-cliente');
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setLoading(false);
    }
  };

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
            title="Cadastrar Veículo"
            description={`Adicionando veículo para CPF: ${formData.cpfCliente}`}
          />
        </div>

        <Card className="max-w-2xl mx-auto p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="placa">Placa do Veículo *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={handleChange}
                className="h-12 uppercase"
                maxLength={8}
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fotos do Veículo *
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

          <div className="flex justify-end gap-4 mt-8">
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
              disabled={loading || !formData.placa || formData.fotos.length === 0}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
