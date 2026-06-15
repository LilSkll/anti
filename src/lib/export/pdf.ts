import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import type { AnalysisBundle } from "@/types/analysis";
import { buildReportSections } from "./report";
import { formatDate, truncate } from "@/lib/utils";

const COLORS = {
  primary: [34, 211, 238] as [number, number, number],
  violet: [129, 140, 248] as [number, number, number],
  dark: [15, 20, 40] as [number, number, number],
  text: [40, 48, 70] as [number, number, number],
  muted: [120, 130, 150] as [number, number, number],
};

export function exportBundleToPdf(b: AnalysisBundle): void {
  const s = buildReportSections(b);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  // Header band
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor(...COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AI Linguistic Discourse Analyzer", margin, 38);
  doc.setTextColor(180, 190, 210);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Научный отчёт по лингвистическому анализу текста", margin, 56);
  doc.setFontSize(9);
  doc.text(formatDate(b.createdAt), pageW - margin, 38, { align: "right" });

  y = 110;

  // Title
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(s.title, maxW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 18 + 8;

  // Intro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  const introLines = doc.splitTextToSize(s.intro, maxW);
  doc.text(introLines, margin, y);
  y += introLines.length * 14 + 16;

  const sectionTitle = (label: string) => {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(2);
    doc.line(margin, y - 4, margin + 24, y - 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text);
    doc.text(label, margin, y);
    y += 18;
  };

  const paragraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(text, maxW);
    if (y + lines.length * 14 > 780) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * 14 + 8;
  };

  // Source text
  sectionTitle("1. Описание текста");
  paragraph(truncate(b.sourceText, 900));

  // Metrics
  if (s.metricsRows.length) {
    sectionTitle("2. Результаты анализа (метрики 0–100)");
    autoTable(doc, {
      startY: y,
      head: [["Метрика", "Значение"]],
      body: s.metricsRows,
      theme: "grid",
      headStyles: {
        fillColor: COLORS.dark,
        textColor: COLORS.primary,
        fontStyle: "bold",
      },
      bodyStyles: { textColor: COLORS.text },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10, cellPadding: 6 },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 18;
  }

  // Discourse
  if (s.discourseRows.length) {
    sectionTitle("3. Дискурс-анализ");
    autoTable(doc, {
      startY: y,
      head: [["Параметр", "Значение"]],
      body: s.discourseRows,
      theme: "grid",
      headStyles: {
        fillColor: COLORS.dark,
        textColor: COLORS.violet,
        fontStyle: "bold",
      },
      bodyStyles: { textColor: COLORS.text },
      styles: { fontSize: 10, cellPadding: 6 },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 18;
  }

  // AI markers
  sectionTitle("4. Признаки ИИ-дискурса");
  if (s.aiMarkers.length) {
    s.aiMarkers.forEach((mk) => paragraph("• " + mk));
  } else {
    paragraph("Ярко выраженные признаки машинного дискурса не зафиксированы.");
  }

  // Human markers
  sectionTitle("5. Признаки человеческого дискурса");
  if (s.humanMarkers.length) {
    s.humanMarkers.forEach((mk) => paragraph("• " + mk));
  } else {
    paragraph("Выраженные маркеры человеческого дискурса не выделены.");
  }

  // Conclusion
  sectionTitle("6. Выводы");
  paragraph(s.conclusion);

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `Страница ${i} из ${pages}`,
      pageW - margin,
      doc.internal.pageSize.getHeight() - 24,
      { align: "right" }
    );
  }

  const blob = doc.output("blob");
  saveAs(blob, `report_${b.id}.pdf`);
}
