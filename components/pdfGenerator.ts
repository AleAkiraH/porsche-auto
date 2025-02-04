import jsPDF from "jspdf"
import "jspdf-autotable"

const LOGO_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/porsche-logo.png-h6369Ri6OvhlOwwMFrhB50VPBSmcUM.jpeg"

export async function generatePDF(orcamento) {
  // Criar novo documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Configurar fontes
  doc.setFont("helvetica")

  // Adicionar logo
  const img = await loadImage(LOGO_URL)
  doc.addImage(img, "JPEG", 15, 15, 40, 20)

  // Cabeçalho com informações de contato
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Porsche Service", 60, 20)
  doc.text("Contato: Sidney", 60, 25)
  doc.text("WhatsApp: (11) 94309-9908", 60, 30)

  // Linha divisória
  doc.setDrawColor(200, 200, 200)
  doc.line(15, 40, 195, 40)

  // Informações principais do orçamento
  doc.setFontSize(22)
  doc.setTextColor(0, 0, 0)
  doc.text("Orçamento", 15, 55)

  // Dados do cliente em destaque
  doc.setFontSize(14)
  doc.setTextColor(70, 70, 70)
  doc.text("Dados do Cliente", 15, 70)

  // Criar boxes com informações principais
  const createInfoBox = (title: string, value: string, x: number, y: number, width: number) => {
    doc.setFillColor(247, 250, 252)
    doc.rect(x, y, width, 20, "F")
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(title, x + 3, y + 6)
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(value, x + 3, y + 15)
  }

  // Boxes de informação
  createInfoBox("Nome", orcamento.nomeCliente, 15, 75, 85)
  createInfoBox("CPF", orcamento.cpfCliente, 105, 75, 85)
  createInfoBox("Telefone", orcamento.telefoneCliente, 15, 100, 85)
  createInfoBox("Placa", orcamento.placaVeiculo, 105, 100, 85)

  // Informações do serviço
  doc.setFontSize(14)
  doc.setTextColor(70, 70, 70)
  doc.text("Detalhes do Serviço", 15, 135)

  // Box com valor e datas
  createInfoBox("Valor do Serviço", orcamento.valorServico, 15, 140, 85)
  createInfoBox("Data de Entrega", orcamento.dataEntrega, 105, 140, 85)

  // Descrição do serviço
  doc.setFontSize(12)
  doc.setTextColor(70, 70, 70)
  doc.text("Descrição", 15, 175)

  // Box para descrição
  doc.setFillColor(247, 250, 252)
  doc.rect(15, 180, 175, 30, "F")
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  const splitDescription = doc.splitTextToSize(orcamento.descricaoServico, 165)
  doc.text(splitDescription, 20, 188)

  // Seção de fotos
  if (orcamento.fotos && orcamento.fotos.length > 0) {
    doc.addPage()
    doc.setFontSize(14)
    doc.setTextColor(70, 70, 70)
    doc.text("Registro Fotográfico", 15, 20)

    // Configuração do grid de imagens (25% menor que a versão anterior)
    const imageWidth = 33.75 // 45 * 0.75
    const imageHeight = 33.75 // 45 * 0.75
    const imagesPerRow = 4
    const margin = 15
    const spacing = 10

    let currentX = margin
    let currentY = 30

    for (let i = 0; i < orcamento.fotos.length; i++) {
      if (currentY > 250) {
        // Se próximo da borda inferior, nova página
        doc.addPage()
        currentX = margin
        currentY = 30
      }

      if (i > 0 && i % imagesPerRow === 0) {
        currentX = margin
        currentY += imageHeight + spacing
      }

      const imgData = await loadImage(orcamento.fotos[i])
      doc.addImage(imgData, "JPEG", currentX, currentY, imageWidth, imageHeight)

      // Adicionar borda à imagem
      doc.setDrawColor(200, 200, 200)
      doc.rect(currentX, currentY, imageWidth, imageHeight)

      currentX += imageWidth + spacing
    }
  }

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
      align: "center",
    })
  }

  doc.save("orcamento_porsche.pdf")
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/jpeg"))
    }
    img.onerror = reject
    img.src = url
  })
}

