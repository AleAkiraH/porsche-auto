"use client"

import { useEffect, useState, Suspense } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Car, FileText, Calendar, Camera, DollarSign } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from 'next/navigation'
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import Image from "next/image"
import { formatarMoeda } from "@/lib/utils"
import React from 'react'

interface FormData {
  placa: string;
  descricao: string;
  previsaoEntrega: string;
  valor: string;
  fotos: string[];
  status: 'pendente' | 'aprovado' | 'reprovado';
  novasFotos: File[];
}

// Loading component
function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
}

// Main edit component
function EditarOrcamentoContent({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [placasDisponiveis, setPlacasDisponiveis] = useState<Array<{value: string, label: string}>>([])
  const [formData, setFormData] = useState<FormData>(() => {
    // Get data from sessionStorage instead of URL params
    const savedData = sessionStorage.getItem('orcamentoData')
    if (savedData) {
      const orcamento = JSON.parse(savedData)
      // Clear the data after using it
      sessionStorage.removeItem('orcamentoData')
      return {
        placa: orcamento.placa || '',
        descricao: orcamento.descricao || '',
        previsaoEntrega: orcamento.previsaoEntrega ? 
          new Date(orcamento.previsaoEntrega).toISOString().split('T')[0] : '',
        valor: formatarMoeda(orcamento.valor || 0),
        fotos: orcamento.fotos || [],
        status: orcamento.status || 'pendente',
        novasFotos: []
      }
    }
    return {
      placa: '',
      descricao: '',
      previsaoEntrega: '',
      valor: '',
      fotos: [],
      status: 'pendente',
      novasFotos: []
    }
  })

  // Buscar placas disponíveis
  useEffect(() => {
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
          const placas = data.message.reduce((acc: string[], cliente: any) => {
            return [...acc, ...(cliente.placa || [])]
          }, []);

          setPlacasDisponiveis(placas.map(placa => ({
            value: placa,
            label: placa
          })));
        }
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      }
    };

    fetchPlacas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === 'valor') {
      formattedValue = value.replace(/\D/g, '')
      formattedValue = (Number(formattedValue) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    }

    setFormData(prev => ({ ...prev, [id]: formattedValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      novasFotos: [...prev.novasFotos, ...files]
    }));
  };

  const removeExistingPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const removeNewPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      novasFotos: prev.novasFotos.filter((_, i) => i !== index)
    }));
  };

  // Adicionar esta função de compressão de imagem
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar se a imagem for muito grande
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Comprimir com qualidade reduzida
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      // Processar e comprimir novas fotos
      const novasFotosBase64 = await Promise.all(
        formData.novasFotos.map(file => compressImage(file))
      );

      const valorString = formData.valor.replace(/[R$\s.]/g, '').replace(',', '.');
      const valorNumerico = parseFloat(valorString);

      const payload = {
        action: 'atualizar_orcamento',
        body: {
          id: id,
          placa: formData.placa,
          descricao: formData.descricao,
          previsaoEntrega: formData.previsaoEntrega,
          valor: valorNumerico,
          status: formData.status,
          fotos: [...formData.fotos, ...novasFotosBase64]
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
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar orçamento');
      }

      router.push('/buscar-orcamento');
    } catch (error) {
      toast.error(`Erro ao atualizar orçamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
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
            title="Editar Orçamento"
            description="Atualização de orçamento"
          />
        </div>

        <Card className="max-w-4xl mx-auto">
          <div className="p-6">
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
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotos Existentes
                </Label>
                <div className="grid grid-cols-4 gap-4">
                  {formData.fotos.map((foto, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={foto}
                        alt={`Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingPhoto(idx)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Adicionar Novas Fotos
                </Label>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from(formData.novasFotos).map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Nova Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewPhoto(idx)}
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

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/buscar-orcamento')}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Page component with error boundary
export default function EditarOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  return (
    <Suspense fallback={<LoadingState />}>
      <EditarOrcamentoContent id={resolvedParams.id} />
    </Suspense>
  );
}
