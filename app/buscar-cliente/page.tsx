"use client"

import { useEffect, useState, useRef } from "react"
import { Search, Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/"

export default function BuscarCliente() {
  const [clientes, setClientes] = useState([])
  const [filteredClientes, setFilteredClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [veiculo, setVeiculo] = useState(null)
  const [placaSelecionada, setPlacaSelecionada] = useState(null)
  const detalhesVeiculoRef = useRef(null)

  const fetchClientes = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_clientes_e_veiculos" }),
      })
      if (!response.ok) {
        throw new Error("Erro ao buscar clientes.")
      }
      const data = await response.json()
      const clientesData = data.message || []
      setClientes(clientesData)
      setFilteredClientes(clientesData)
    } catch (error) {
      console.error("Error fetching clients:", error)
      setClientes([])
      setFilteredClientes([])
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    const clienteFiltrado = clientes.filter((cliente) => {
      const searchValue = value.toLowerCase()
      return (
        cliente.nome.toLowerCase().includes(searchValue) ||
        cliente.telefone.toLowerCase().includes(searchValue) ||
        cliente.cpf.toLowerCase().includes(searchValue) ||
        (cliente.placa && cliente.placa.join(", ").toLowerCase().includes(searchValue))
      )
    })
    setFilteredClientes(clienteFiltrado)
  }

  const buscarVeiculo = async (placa) => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_veiculo", placa }),
      })
      if (!response.ok) {
        throw new Error("Erro ao buscar veículo.")
      }
      const data = await response.json()
      setVeiculo(data)
      setPlacaSelecionada(placa)

      if (detalhesVeiculoRef.current) {
        detalhesVeiculoRef.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error)
      setVeiculo(null)
    }
  }

  const clientesFiltradosParaExibir = placaSelecionada
    ? clientes.filter((cliente) => cliente.placa && cliente.placa.includes(placaSelecionada))
    : filteredClientes

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buscar Cliente</h1>
        <p className="text-gray-600">Pesquise e gerencie os clientes cadastrados</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Pesquisar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nome, telefone, CPF ou placa..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesFiltradosParaExibir.length > 0 ? (
                      clientesFiltradosParaExibir.map((cliente, index) => {
                        const placas = cliente.placa || [];
                        return placas.length > 0 ? (
                          placas.map((placa, placaIndex) => (
                            <tr key={`${index}-${placaIndex}`} className="hover:bg-gray-50">
                              {placaIndex === 0 && (
                                <>
                                  <td className="px-4 py-3 whitespace-nowrap" rowSpan={placas.length}>
                                    {cliente.nome}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap" rowSpan={placas.length}>
                                    {cliente.telefone}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap" rowSpan={placas.length}>
                                    {cliente.cpf}
                                  </td>
                                </>
                              )}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  onClick={() => buscarVeiculo(placa)}
                                  className="text-green-600 hover:text-green-700 hover:underline"
                                >
                                  {placa}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">{cliente.nome}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{cliente.telefone}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{cliente.cpf}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-500">Sem placa</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {veiculo && (
        <Card className="bg-card" ref={detalhesVeiculoRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              Detalhes do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <span className="font-medium">Placa:</span> {veiculo.placa}
              </div>
              <div>
                <span className="font-medium">CPF do Cliente:</span> {veiculo.cpf_cliente}
              </div>
              <div>
                <span className="font-medium">Fotos:</span>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {veiculo.fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={foto || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      className="aspect-square rounded-lg object-cover w-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}