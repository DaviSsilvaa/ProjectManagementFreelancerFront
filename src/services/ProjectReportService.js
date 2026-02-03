import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importação nomeada

export const generateProjectPDF = (project) => {
  const doc = new jsPDF();
  
  
  const colors = {
    primary: [30, 41, 59],
    secondary: [100, 116, 139],
    text: [51, 65, 85]
  };

  // 1. Cabeçalho
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO DE PROJETO", 14, 25);

  // 2. A CORREÇÃO: Chame a função autoTable passando o 'doc'
  autoTable(doc, {
    startY: 50,
    head: [['ESPECIFICAÇÃO', 'DADOS DO CONTRATO']],
    body: [
      ['TÍTULO DO PROJETO', project.title.toUpperCase()],
      ['CLIENTE RESPONSÁVEL', project.client?.name || 'NÃO INFORMADO'],
      ['VALOR CONTRATUAL', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget || 0)],
      ['PRAZO DE ENTREGA', project.end_date ? new Date(project.end_date).toLocaleDateString('pt-BR') : 'A DEFINIR'],
      ['STATUS OPERACIONAL', project.status?.toUpperCase() || 'PENDENTE'],
    ],
    theme: 'grid',
    headStyles: { fillColor: colors.primary },
    styles: { cellPadding: 5, fontSize: 10 },
  });

  // 3. Escopo (Use doc.lastAutoTable.finalY para saber onde a tabela terminou)
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.text("DETALHAMENTO TÉCNICO E ESCOPO", 14, finalY);

  doc.setFontSize(11);
  doc.setTextColor(...colors.text);
  const description = project.description || "Nenhum detalhamento técnico registrado.";
  const splitText = doc.splitTextToSize(description, 180);
  doc.text(splitText, 14, finalY + 10);

  doc.save(`Projeto_${project.title.replace(/\s+/g, '_')}.pdf`);
};