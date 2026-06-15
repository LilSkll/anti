import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { AnalysisBundle } from "@/types/analysis";
import { buildReportSections } from "./report";
import { truncate } from "@/lib/utils";

const CYAN = "22D3EE";
const VIOLET = "818CF8";
const DARK = "0F1428";
const MUTED = "78829A";

function heading(text: string, color = CYAN): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text, bold: true, color, size: 26 }),
    ],
  });
}

function para(text: string, opts: { muted?: boolean; bullet?: boolean } = {}): Paragraph {
  return new Paragraph({
    bullet: opts.bullet ? { level: 0 } : undefined,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: 21,
        color: opts.muted ? MUTED : "1E293B",
      }),
    ],
  });
}

function makeTable(rows: [string, string][], headerColor = CYAN): Table {
  const header = new TableRow({
    children: [
      new TableCell({
        width: { size: 55, type: WidthType.PERCENTAGE },
        shading: { fill: DARK },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Параметр", bold: true, color: headerColor, size: 20 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 45, type: WidthType.PERCENTAGE },
        shading: { fill: DARK },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Значение", bold: true, color: headerColor, size: 20 })],
          }),
        ],
      }),
    ],
  });

  const body = rows.map(
    ([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: k, size: 20 })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: v, size: 20 })] })],
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...body],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "EDF2F7" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "EDF2F7" },
    },
  });
}

export async function exportBundleToDocx(b: AnalysisBundle): Promise<void> {
  const s = buildReportSections(b);

  const children: (Paragraph | Table)[] = [
    // Title block
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "AI Linguistic Discourse Analyzer", bold: true, color: CYAN, size: 36 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: s.meta, italics: true, color: MUTED, size: 18 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: s.title, bold: true, size: 28, color: "0F1428" })],
    }),
    para(s.intro, { muted: true }),

    heading("1. Описание текста"),
    para(truncate(b.sourceText, 1200)),

    heading("2. Результаты анализа"),
    ...(s.metricsRows.length
      ? [makeTable(s.metricsRows, CYAN), para("")]
      : [para("Метрики не рассчитаны.")]),

    heading("3. Дискурс-анализ", VIOLET),
    ...(s.discourseRows.length
      ? [makeTable(s.discourseRows, VIOLET), para("")]
      : [para("Дискурс-анализ не выполнен.")]),

    heading("4. Признаки ИИ-дискурса"),
    ...(s.aiMarkers.length
      ? s.aiMarkers.map((m) => para(m, { bullet: true }))
      : [para("Ярко выраженные признаки машинного дискурса не зафиксированы.")]),

    heading("5. Признаки человеческого дискурса"),
    ...(s.humanMarkers.length
      ? s.humanMarkers.map((m) => para(m, { bullet: true }))
      : [para("Выраженные маркеры человеческого дискурса не выделены.")]),

    heading("6. Выводы"),
    para(s.conclusion),
  ];

  const doc = new Document({
    creator: "AI Linguistic Discourse Analyzer",
    title: s.title,
    description: "Научный отчёт по лингвистическому анализу текста",
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `report_${b.id}.docx`);
}
