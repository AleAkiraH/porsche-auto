import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrcamentoPDFProps {
  orcamento: {
    _id: string;
    placa: string;
    descricao: string;
    previsaoEntrega: string;
    valor: number;
    status: string;
    dataHora: string;
    fotos?: string[];
  }
}

export async function generatePDF(orcamento: OrcamentoPDFProps['orcamento']) {
  const pdf = new jsPDF('p', 'pt', 'a4');
  
  // Configurações da página
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  let yPos = margin;

  // Funções auxiliares
  const addCenteredText = (text: string, y: number, size = 12) => {
    pdf.setFontSize(size);
    const textWidth = pdf.getStringUnitWidth(text) * size;
    pdf.text(text, (pageWidth - textWidth) / 2, y);
  };

  const addText = (text: string, y: number, size = 12) => {
    pdf.setFontSize(size);
    pdf.text(text, margin, y);
  };

  // Adicionar logo (substitua pelo caminho correto da sua logo)
  const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg';
  const img = new Image();
  
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = logoUrl;
  });

  // Cabeçalho
  const logoWidth = 100;
  const logoHeight = (img.height * logoWidth) / img.width;
  pdf.addImage(img, 'PNG', (pageWidth - logoWidth) / 2, yPos, logoWidth, logoHeight);
  
  yPos += logoHeight + 20;

  // Informações da empresa
  pdf.setFont('helvetica', 'bold');
  addCenteredText('PORSCHE AUTO ELÉTRICO', yPos, 16);
  yPos += 20;
  
  pdf.setFont('helvetica', 'normal');
  addCenteredText('CNPJ: 12.345.678/0001-90', yPos, 12);
  yPos += 40;

  // Título do orçamento
  pdf.setFont('helvetica', 'bold');
  addCenteredText(`ORÇAMENTO Nº ${orcamento._id.slice(-6)}`, yPos, 14);
  yPos += 40;

  // Informações do orçamento
  pdf.setFont('helvetica', 'normal');
  const data = new Date(orcamento.dataHora).toLocaleDateString('pt-BR');
  const previsao = new Date(orcamento.previsaoEntrega).toLocaleDateString('pt-BR');
  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valor);

  addText(`Data: ${data}`, yPos);
  yPos += 20;
  addText(`Placa do Veículo: ${orcamento.placa}`, yPos);
  yPos += 20;
  addText(`Previsão de Entrega: ${previsao}`, yPos);
  yPos += 20;
  addText(`Status: ${orcamento.status.toUpperCase()}`, yPos);
  yPos += 40;

  // Descrição dos serviços
  pdf.setFont('helvetica', 'bold');
  addText('DESCRIÇÃO DOS SERVIÇOS:', yPos);
  yPos += 20;

  pdf.setFont('helvetica', 'normal');
  const descricaoLines = pdf.splitTextToSize(orcamento.descricao, pageWidth - (2 * margin));
  pdf.text(descricaoLines, margin, yPos);
  yPos += (descricaoLines.length * 15) + 40;

  // Valor total
  pdf.setFont('helvetica', 'bold');
  addText(`Valor Total: ${valor}`, yPos);
  yPos += 60;

  // Área de assinatura
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 20;
  addCenteredText('Assinatura do Cliente', yPos);
  yPos += 20;
  addCenteredText('_____________________________________', yPos);

  // Após adicionar todas as informações do orçamento, vamos adicionar as fotos
  if (orcamento.fotos && orcamento.fotos.length > 0) {
    // Adiciona uma nova página para as fotos
    pdf.addPage();
    
    yPos = margin;
    addCenteredText('REGISTRO FOTOGRÁFICO', yPos, 14);
    yPos += 30;

    // Define o layout da grade de fotos (2 colunas)
    const imageWidth = (pageWidth - (margin * 3)) / 2; // Largura ajustada para 2 colunas
    const imageHeight = imageWidth * 0.75; // Proporção 4:3
    let xPos = margin;

    // Processa cada foto
    for (let i = 0; i < orcamento.fotos.length; i++) {
      try {
        // Se precisar começar uma nova página
        if (yPos + imageHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }

        // Se for a segunda imagem na linha, ajusta xPos
        if (i % 2 === 1) {
          xPos = margin * 2 + imageWidth;
        } else {
          xPos = margin;
        }

        // Carrega e adiciona a imagem
        const img = await loadImage(orcamento.fotos[i]);
        pdf.addImage(
          img, 
          'JPEG', 
          xPos, 
          yPos, 
          imageWidth, 
          imageHeight
        );

        // Avança para a próxima posição
        if (i % 2 === 1) {
          yPos += imageHeight + margin;
        }
      } catch (error) {
        console.error(`Erro ao processar imagem ${i + 1}:`, error);
      }
    }
  }

  // Rodapé
  yPos = pdf.internal.pageSize.getHeight() - 40;
  pdf.setFontSize(8);
  addCenteredText('Este documento é um orçamento e tem validade de 15 dias.', yPos);

  return pdf;
}

// Função auxiliar para carregar imagem
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Importante para URLs externas
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
