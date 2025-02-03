"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "react-modal";
import jsPDF from "jspdf";

const LAMBDA_URL = "https://5zmn1ieu92.execute-api.us-east-1.amazonaws.com/";

export default function BuscarOrcamento() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [filteredOrcamentos, setFilteredOrcamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);

  const fetchOrcamentos = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "buscar_orcamentos" }),
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar orçamentos.");
      }
      const data = await response.json();
      console.log("Dados recebidos da API:", data);
      const orcamentosData = data.message || [];
      setOrcamentos(orcamentosData);
      setFilteredOrcamentos(orcamentosData);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setOrcamentos([]);
      setFilteredOrcamentos([]);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const orcamentoFiltrado = orcamentos.filter((orcamento) => {
      const searchValue = value.toLowerCase();
      return (
        orcamento.descricaoServico.toLowerCase().includes(searchValue) ||
        orcamento.placaVeiculo.toLowerCase().includes(searchValue) ||
        orcamento.dataEntrega.toLowerCase().includes(searchValue) ||
        (orcamento.nomeCliente && orcamento.nomeCliente.toLowerCase().includes(searchValue)) ||
        (orcamento.telefoneCliente && orcamento.telefoneCliente.includes(searchValue))
      );
    });
    setFilteredOrcamentos(orcamentoFiltrado);
  };

  const handlePrintClick = (orcamento) => {
    setSelectedOrcamento(orcamento);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedOrcamento(null);
  };

  const downloadPDF = async () => {
    if (!selectedOrcamento) return;
  
    const doc = new jsPDF();
    doc.text("Detalhes do Orçamento", 10, 10);
    doc.text(`Data/Hora: ${selectedOrcamento.dataHora}`, 10, 20);
    doc.text(`Data de Entrega: ${selectedOrcamento.dataEntrega}`, 10, 30);
    doc.text(`Descrição do Serviço: ${selectedOrcamento.descricaoServico}`, 10, 40);
    doc.text(`Valor do Serviço: ${selectedOrcamento.valorServico}`, 10, 50);
    doc.text(`Placa do Veículo: ${selectedOrcamento.placaVeiculo}`, 10, 60);
    doc.text(`Nome do Cliente: ${selectedOrcamento.nomeCliente}`, 10, 70);
    doc.text(`Telefone do Cliente: ${selectedOrcamento.telefoneCliente}`, 10, 80);
    doc.text(`CPF do Cliente: ${selectedOrcamento.cpfCliente}`, 10, 90);
  
    let xOffset = 10; // Posição inicial X para imagens
    let yOffset = 110; // Posição inicial Y para imagens
    const imgWidth = 50; // Largura de cada imagem
    const imgHeight = 50; // Altura de cada imagem
    const pageWidth = doc.internal.pageSize.width; // Largura total da página
    const margin = 10; // Margem entre as imagens
  
    if (selectedOrcamento.fotos && selectedOrcamento.fotos.length > 0) {
      try {
        const imagensCarregadas = await Promise.all(
          selectedOrcamento.fotos.map((foto) => loadImage(foto))
        );
  
        imagensCarregadas.forEach((imgData, index) => {
          if (xOffset + imgWidth > pageWidth - margin) {
            // Se não couber mais na linha, pula para a próxima linha
            xOffset = 10;
            yOffset += imgHeight + 10;
          }
  
          doc.addImage(imgData, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
          xOffset += imgWidth + margin; // Move para a direita
        });
      } catch (error) {
        console.error("Erro ao carregar as imagens:", error);
      }
    }
  
    doc.save("orcamento.pdf");
  };
  
  // Função auxiliar para carregar imagens e convertê-las para base64
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.onerror = (err) => reject(err);
    });
  };
  

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
              placeholder="Buscar por descrição, placa, data de entrega, nome ou telefone..."
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
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Descrição do Serviço</th>
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
                        <td className="py-3 px-4">{orcamento.descricaoServico}</td>
                        <td className="py-3 px-4">{orcamento.valorServico}</td>
                        <td className="py-3 px-4">{orcamento.placaVeiculo}</td>
                        <td className="py-3 px-4">{orcamento.nomeCliente}</td>
                        <td className="py-3 px-4">{orcamento.telefoneCliente}</td>
                        <td className="py-3 px-4">{orcamento.cpfCliente}</td>
                        <td className="py-3 px-4">
                          <Button 
                            onClick={() => handlePrintClick(orcamento)} 
                            className="w-full"
                          >
                            Imprimir
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
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
      {/* Modal para exibir detalhes do orçamento */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalhes do Orçamento"
        className="modal"
      >
        <h2 className="text-2xl font-bold">Detalhes do Orçamento</h2>
        {selectedOrcamento && (
          <div>
            <p><strong>Data/Hora:</strong> {selectedOrcamento.dataHora}</p>
            <p><strong>Data de Entrega:</strong> {selectedOrcamento.dataEntrega}</p>
            <p><strong>Descrição do Serviço:</strong> {selectedOrcamento.descricaoServico}</p>
            <p><strong>Valor do Serviço:</strong> {selectedOrcamento.valorServico}</p>
            <p><strong>Placa do Veículo:</strong> {selectedOrcamento.placaVeiculo}</p>
            <p><strong>Nome do Cliente:</strong> {selectedOrcamento.nomeCliente}</p>
            <p><strong>Telefone do Cliente:</strong> {selectedOrcamento.telefoneCliente}</p>
            <p><strong>CPF do Cliente:</strong> {selectedOrcamento.cpfCliente}</p>

            {/* Exibir as fotos */}
            {selectedOrcamento.fotos && selectedOrcamento.fotos.length > 0 && (
              <div className="my-4">
                <h3 className="text-lg font-semibold">Fotos:</h3>
                <div className="flex flex-wrap">
                  {selectedOrcamento.fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="my-2 mr-2"
                      style={{ width: '100px', height: 'auto', objectFit: 'cover' }} // Ajuste o tamanho aqui
                    />
                  ))}
                </div>
              </div>
            )}

            <Button onClick={downloadPDF} className="mt-4">Baixar PDF</Button>
            <Button onClick={closeModal} className="mt-4 ml-2">Fechar</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}