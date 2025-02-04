"use client"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generatePDF } from "@/components/pdfGenerator"

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/"

export default function BuscarOrcamento() {
  const [orcamentos, setOrcamentos] = useState([])
  const [filteredOrcamentos, setFilteredOrcamentos] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_orcamentos" }),
      })
      if (!response.ok) {
        throw new Error("Erro ao buscar orçamentos.")
      }
      const data = await response.json()
      console.log("Dados recebidos da API:", data)
      const orcamentosData = data.message || []
      setOrcamentos(orcamentosData)
      setFilteredOrcamentos(orcamentosData)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      setOrcamentos([])
      setFilteredOrcamentos([])
    }
  }

  useEffect(() => {
    fetchOrcamentos()
  }, [fetchOrcamentos]) // Added fetchOrcamentos to the dependency array

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    const orcamentoFiltrado = orcamentos.filter((orcamento) => {
      const searchValue = value.toLowerCase()
      return (
        orcamento.placaVeiculo.toLowerCase().includes(searchValue) ||
        orcamento.dataEntrega.toLowerCase().includes(searchValue) ||
        (orcamento.nomeCliente && orcamento.nomeCliente.toLowerCase().includes(searchValue)) ||
        (orcamento.telefoneCliente && orcamento.telefoneCliente.includes(searchValue))
      )
    })
    setFilteredOrcamentos(orcamentoFiltrado)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buscar Orçamentos</h1>
          <p className="mt-2 text-gray-600">Pesquise e gerencie os orçamentos cadastrados</p>
        </div>
      </div>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Pesquisar Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por placa, data de entrega, nome ou telefone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Data/Hora</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Data de Entrega</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Valor do Serviço</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Placa do Veículo</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Nome do Cliente</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Telefone do Cliente</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">CPF do Cliente</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrcamentos.length > 0 ? (
                    filteredOrcamentos.map((orcamento, index) => (
                      <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 px-4">{orcamento.dataHora}</td>
                        <td className="py-3 px-4">{orcamento.dataEntrega}</td>
                        <td className="py-3 px-4">{orcamento.valorServico}</td>
                        <td className="py-3 px-4">{orcamento.placaVeiculo}</td>
                        <td className="py-3 px-4">{orcamento.nomeCliente}</td>
                        <td className="py-3 px-4">{orcamento.telefoneCliente}</td>
                        <td className="py-3 px-4">{orcamento.cpfCliente}</td>
                        <td className="py-3 px-4">
                          <Button onClick={() => generatePDF(orcamento)} className="w-full">
                            Imprimir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
                        Nenhum orçamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

