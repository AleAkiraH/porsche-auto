"use client"
import { useState, useEffect } from "react"
import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/"

// Função para formatar a data no formato "dia/mês/ano - dia da semana"
const formatDateToPT = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Sao_Paulo',
  };
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
};

export default function CadastrarOrcamento() {
  const [formData, setFormData] = useState({
    dataHora: formatDateToPT(new Date()),
    dataEntrega: "",
    descricaoServico: "",
    valorServico: "",
    placaVeiculo: "",
  });
  const [veiculos, setVeiculos] = useState<{ nome: string; telefone: string; cpf: string; placa: string[] }[]>([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState<{ nome: string; telefone: string; cpf: string; placa: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVeiculos = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_clientes_e_veiculos" }),
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar veículos.");
      }
      const data = await response.json();
      const veiculosData = data.message || [];
      setVeiculos(veiculosData);
      setFilteredVeiculos(veiculosData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  useEffect(() => {
    setFilteredVeiculos(
      veiculos.filter(veiculo =>
        veiculo.placa.some(placa => placa.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, veiculos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value) / 100);
    setFormData((prev) => ({ ...prev, valorServico: formattedValue }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, placaVeiculo: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const formattedDate = formatDateToPT(selectedDate);
    setFormData((prev) => ({ ...prev, dataEntrega: formattedDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    try {
      const dataToSend = {
        action: "cadastrar_orcamento",
        ...formData,
      };
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro desconhecido ao cadastrar orçamento.");
      }
      const responseData = await response.json();
      setFeedback({ type: "success", message: responseData.message });
      setFormData({
        dataHora: formatDateToPT(new Date()),
        dataEntrega: "",
        descricaoServico: "",
        valorServico: "",
        placaVeiculo: "",
      });
      setSearchTerm("");
    } catch (error) {
      console.error("Error details:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? `Erro ao cadastrar orçamento: ${error.message}`
            : "Erro desconhecido ao cadastrar orçamento. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Orçamento</h1>
          <p className="mt-2 text-gray-600">Insira os detalhes do orçamento para registro</p>
        </div>
      </div>
      <Card className="bg-card p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Novo Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback && (
            <div
              className={`mb-4 rounded-lg p-2 ${
                feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Input id="dataHora" name="dataHora" value={formData.dataHora} onChange={handleInputChange} type="text" required disabled />
              </div>
              <div className="grid gap-1">
                <label htmlFor="dataEntrega" className="text-sm font-medium text-gray-700">
                  Data Prevista de Entrega
                </label>
                <Input 
                  id="dataEntrega" 
                  name="dataEntrega" 
                  onChange={handleDateChange} 
                  type="date" 
                  required 
                  className="border rounded-md p-2 w-full"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="descricaoServico" className="text-sm font-medium text-gray-700">
                  Descrição do Serviço
                </label>
                <textarea
                  id="descricaoServico"
                  name="descricaoServico"
                  value={formData.descricaoServico}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="border rounded-md p-2 w-full"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="valorServico" className="text-sm font-medium text-gray-700">
                  Valor do Serviço
                </label>
                <Input
                  id="valorServico"
                  name="valorServico"
                  value={formData.valorServico}
                  onChange={handleValorChange}
                  type="text"
                  required
                  className="w-1/2"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="placaVeiculo" className="text-sm font-medium text-gray-700">
                  Placa do Veículo
                </label>                
                <select
                  id="placaVeiculo"
                  name="placaVeiculo"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={formData.placaVeiculo}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Selecione um veículo</option>
                  {filteredVeiculos.length === 0 ? (
                    <option disabled>Nenhum veículo encontrado</option>
                  ) : (
                    filteredVeiculos.flatMap((veiculo) =>
                      veiculo.placa.map((placa) => (
                        <option key={placa} value={placa}>
                          {placa} - {veiculo.nome} - {veiculo.telefone}
                        </option>
                      ))
                    )
                  )}
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Orçamento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}