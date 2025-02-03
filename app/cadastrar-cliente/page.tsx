"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { maskCPF, maskPhone } from "../../utils/masks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/"

export default function CadastrarCliente() {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cpf: "",
  })
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cadastrar_cliente", ...formData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro desconhecido ao cadastrar cliente.")
      }

      const responseData = await response.json()
      setFeedback({ type: "success", message: responseData.message })
      setFormData({ nome: "", telefone: "", cpf: "" })
    } catch (error) {
      console.error("Error details:", error)
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? `Erro ao cadastrar cliente: ${error.message}`
            : "Erro desconhecido ao cadastrar cliente. Por favor, tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let maskedValue = value
    if (name === "cpf") {
      maskedValue = maskCPF(value)
    } else if (name === "telefone") {
      maskedValue = maskPhone(value)
    }
    setFormData((prev) => ({ ...prev, [name]: maskedValue }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Cliente</h1>
          <p className="mt-2 text-gray-600">Adicione um novo cliente ao sistema</p>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Novo Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                feedback.type === "success"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  Nome
                </label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
              </div>

              <div className="grid gap-2">
                <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  maxLength={15}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                  CPF
                </label>
                <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleInputChange} maxLength={14} required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

