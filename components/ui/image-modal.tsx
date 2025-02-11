"use client"

import { XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
}

export function ImageModal({ isOpen, imageUrl, onClose }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full h-[80vh] bg-background rounded-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 text-white hover:text-red-500 transition-colors"
          >
            <XCircle className="h-8 w-8" />
          </button>
          <div className="w-full h-full relative">
            <Image
              src={imageUrl}
              alt="Foto do veículo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
