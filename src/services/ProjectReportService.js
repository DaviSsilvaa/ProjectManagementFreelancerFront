import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateProjectPDF = (project, aiResult) => {
  const doc = new jsPDF();

  const colors = {
    purpleDark: [76, 29, 149],
    purpleMain: [124, 58, 237], 
    purpleLight: [245, 243, 255],
    text: [30, 41, 59], 
    line: [221, 214, 254],
  };

  doc.setFillColor(...colors.purpleDark);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO DE PROJETO", 14, 26);

  autoTable(doc, {
    startY: 50,
    head: [["ESPECIFICAÇÃO", "DADOS DO CONTRATO"]],
    body: [
      ["TÍTULO DO PROJETO", project.title?.toUpperCase()],
      ["CLIENTE RESPONSÁVEL", project.client?.name || "NÃO INFORMADO"],
      [
        "VALOR CONTRATUAL",
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(project.budget || 0),
      ],
      ["STATUS OPERACIONAL", project.status?.toUpperCase() || "PENDENTE"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: colors.purpleDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      textColor: colors.text,
    },
  });

  let currentY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(...colors.purpleDark);
  doc.text("DETALHAMENTO TÉCNICO E ESCOPO", 14, currentY);

  doc.setFontSize(10);
  doc.setTextColor(...colors.text);
  const splitDesc = doc.splitTextToSize(
    project.description || "Sem descrição.",
    180,
  );
  doc.text(splitDesc, 14, currentY + 10);

  currentY += 15 + splitDesc.length * 5;

  if (aiResult) {
    doc.setFillColor(...colors.purpleLight);
    doc.rect(14, currentY, 182, 10, "F");

    doc.setFontSize(14);
    doc.setTextColor(...colors.purpleMain);
    doc.text("✨ CONSULTORIA INTELIGENTE)", 17, currentY + 7);

    autoTable(doc, {
      startY: currentY + 12,
      body: [
        ["ANÁLISE FINANCEIRA", aiResult.analise_cliente],
        ["VIABILIDADE TÉCNICA", aiResult.viabilidade_financeira],
        ["ALERTA DE SEGURANÇA", aiResult.alerta_margem_lucro],
        ["RISCOS IDENTIFICADOS", aiResult.risco_prazo],
      ],
      theme: "plain",
      styles: { cellPadding: 4, fontSize: 9, textColor: colors.text },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, textColor: colors.purpleMain },
      },
    });
  }

  doc.save(`Relatorio_${project.title?.replace(/\s+/g, "_")}.pdf`);
};
