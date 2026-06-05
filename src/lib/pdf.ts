function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|h1|h2|h3|h4|div|li)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface ComprovanteData {
  enrollmentCode: string;
  contractHtml: string;
  signatureDataUrl: string;
  studentName: string;
  courseName: string;
  version: string;
  ip?: string | null;
  dateISO?: string;
}

// Gera o PDF do comprovante de matrícula (contrato + assinatura + metadados).
// jsPDF é importado sob demanda (code-splitting) para aliviar o bundle inicial.
export async function generateComprovante(d: ComprovanteData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  const maxW = W - M * 2;
  let y = M;

  const dateStr = new Date(d.dateISO ?? Date.now()).toLocaleString("pt-BR");

  const ensure = (need: number) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };

  // Cabeçalho
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, W, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Grupo Educacional Meta", M, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Comprovante de Matrícula", M, 19);
  y = 32;

  // Metadados
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  const meta = [
    `Nº da matrícula: ${d.enrollmentCode}`,
    `Aluno(a): ${d.studentName}`,
    `Curso: ${d.courseName}`,
    `Contrato: versão ${d.version}`,
    `Data/hora: ${dateStr}`,
    `IP do signatário: ${d.ip ?? "não capturado"}`,
  ];
  doc.setDrawColor(220);
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(M, y, maxW, meta.length * 6 + 6, 2, 2, "FD");
  y += 7;
  meta.forEach((line) => {
    doc.text(line, M + 4, y);
    y += 6;
  });
  y += 6;

  // Contrato
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  ensure(10);
  doc.text("Contrato assinado", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const lines = doc.splitTextToSize(htmlToText(d.contractHtml), maxW);
  for (const line of lines) {
    ensure(5);
    doc.text(line, M, y);
    y += 4.6;
  }
  y += 6;

  // Assinatura
  ensure(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Assinatura do(a) aluno(a):", M, y);
  y += 4;
  try {
    doc.addImage(d.signatureDataUrl, "PNG", M, y, 70, 28);
  } catch {
    /* assinatura indisponível */
  }
  y += 30;
  doc.setDrawColor(120);
  doc.line(M, y, M + 70, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Documento gerado eletronicamente. A assinatura digital e o registro de IP comprovam o aceite.",
    M,
    y,
  );

  doc.save(`matricula-${d.enrollmentCode}.pdf`);
}
