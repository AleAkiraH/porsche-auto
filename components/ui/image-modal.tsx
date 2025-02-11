"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  images?: string[] // Tornar images opcional
}

export function ImageModal({ isOpen, imageUrl, onClose, images = [] }: ImageModalProps) { // Valor padrão array vazio
  const currentIndex = images?.indexOf(imageUrl) ?? 0 // Fallback para 0 se undefined
  const [activeIndex, setActiveIndex] = useState(currentIndex)

  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [imageUrl, currentIndex])

  const handlePrevious = () => {
    if (!images?.length) return
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    if (!images?.length) return
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Simplificar a lógica de currentImageUrl
  const currentImageUrl = imageUrl || '/placeholder-image.jpg'

  if (!currentImageUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
        <DialogTitle className="sr-only">Visualizar Imagem</DialogTitle>
        <div className="relative w-full aspect-square">
          <Image
            src={currentImageUrl}
            alt="Imagem do veículo"
            fill
            className="object-contain"
            priority
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {(images?.length ?? 0) > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {(images?.length ?? 0) > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === activeIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
