"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { themeColors, layoutClasses } from "@/constants/styles"

// Componente do formulário separado
const VeiculoForm = dynamic(() => import('./components/veiculo-form'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function CadastrarVeiculoPage() {
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
            description="Adicione um novo veículo"
          />
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }>
          <VeiculoForm />
        </Suspense>
      </div>
    </div>
  )
}
