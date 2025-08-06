import jsPDF from 'jspdf'

export function generateTranslatedPDF(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string,
  fileName: string
): Blob {
  try {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    
    // Título
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Tradução Quântica - QuantumTranslate AI', margin, 30)
    
    // Informações do arquivo
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Arquivo: ${fileName}`, margin, 50)
    pdf.text(`Idioma Original: ${sourceLanguage}`, margin, 60)
    pdf.text(`Idioma Traduzido: ${targetLanguage}`, margin, 70)
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, 80)
    
    // Linha separadora
    pdf.line(margin, 90, pageWidth - margin, 90)
    
    let yPosition = 110
    
    // Texto Original
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TEXTO ORIGINAL:', margin, yPosition)
    yPosition += 15
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const originalLines = pdf.splitTextToSize(originalText, maxWidth)
    pdf.text(originalLines, margin, yPosition)
    yPosition += originalLines.length * 5 + 20
    
    // Verificar se precisa de nova página
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage()
      yPosition = 30
    }
    
    // Texto Traduzido
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('TEXTO TRADUZIDO:', margin, yPosition)
    yPosition += 15
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const translatedLines = pdf.splitTextToSize(translatedText, maxWidth)
    pdf.text(translatedLines, margin, yPosition)
    
    // Rodapé
    const pageCount = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text(
        'Gerado por QuantumTranslate AI - Tradução Neural Quântica',
        margin,
        pdf.internal.pageSize.getHeight() - 10
      )
    }
    
    return pdf.output('blob')
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Erro ao gerar PDF')
  }
}
