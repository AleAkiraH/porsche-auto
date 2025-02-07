"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Car, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/";

export default function CadastrarVeiculo() {
  const [formData, setFormData] = useState({
    placa: "",
    cpfCliente: "",
    fotos: [] as string[],
  });
  const [fotos, setFotos] = useState<string[]>([]);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientes, setClientes] = useState<{ nome: string; cpf: string }[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClientes = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_clientes_e_veiculos" }),
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar clientes.");
      }
      const data = await response.json();
      const clientesData = data.message || [];
      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setFeedback({ type: "error", message: "Erro ao buscar clientes." });
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() })); // Converte para maiúsculas
  };

  const validatePlaca = (placa: string) => {
    // Validação da placa
    const regex = /^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2}|[A-Z]{2}\d[A-Z]\d{2})$/;
    return regex.test(placa);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    // Validação da placa
    if (!validatePlaca(formData.placa)) {
      setFeedback({ type: "error", message: "Formato de placa inválido. A placa deve estar no formato correto." });
      setIsLoading(false);
      return;
    }

    try {
      const dataToSend = {
        action: "cadastrar_veiculo",
        ...formData,
        fotos: fotos,
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
        throw new Error(errorData.message || "Erro desconhecido ao cadastrar veículo.");
      }
      const responseData = await response.json();
      setFeedback({ type: "success", message: responseData.message });
      setFormData({ placa: "", cpfCliente: "", fotos: [] });
      setFotos([]);
    } catch (error) {
      console.error("Detalhes do erro:", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? `Erro ao cadastrar veículo: ${error.message}` : "Erro desconhecido. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registre um Novo Veículo</h1>
          <p className="mt-2 text-gray-600">Insira os detalhes do veículo para registro</p>
        </div>
      </div>
      <Card className="bg-card p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            Novo Veículo
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
                <label htmlFor="placa" className="text-sm font-medium text-gray-700">
                  Placa
                </label>
                <Input 
                  id="placa" 
                  name="placa" 
                  value={formData.placa} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="cpfCliente" className="text-sm font-medium text-gray-700">
                  Cliente
                </label>
                <select
                  id="cpfCliente"
                  name="cpfCliente"
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={formData.cpfCliente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.cpf} value={cliente.cpf}>
                      {`${cliente.nome} (${cliente.cpf})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium text-gray-700">Fotos</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Camera className="h-4 w-4" />
                    Adicionar Foto
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFotoCapture}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={foto || "/placeholder.svg"}
                        alt={`Foto ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                        onClick={() => setExpandedPhoto(foto)}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFoto(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Veículo"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {expandedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setExpandedPhoto(null)}
        >
          <div className="max-h-[90vh] max-w-[90vw]">
            <img
              src={expandedPhoto || "/placeholder.svg"}
              alt="Foto expandida"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}