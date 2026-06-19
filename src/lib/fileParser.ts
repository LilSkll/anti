// ===========================================================================
// Чтение текста из загруженных файлов.
// Поддержка: .docx (через mammoth), .txt / .md (через FileReader).
// Никакого backend — всё в браузере.
// ===========================================================================

export interface ParsedFile {
  name: string;
  text: string;
  size: number;
  format: "docx" | "txt" | "md";
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 МБ

function detectFormat(name: string): "docx" | "txt" | "md" | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".txt")) return "txt";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
  return null;
}

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new ParseError("Не удалось прочитать текстовый файл."));
    reader.readAsText(file, "utf-8");
  });
}

async function readDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // mammoth — CommonJS-модуль, динамический импорт браузерной сборки
  const mammoth = await import("mammoth/mammoth.browser");
  try {
    const result = await (mammoth as {
      extractRawText: (i: ArrayBuffer) => Promise<{ value: string }>;
    }).extractRawText(arrayBuffer);
    return (result.value ?? "").trim();
  } catch (e) {
    throw new ParseError(
      `Ошибка чтения .docx: ${(e as Error).message || "неверный формат"}`
    );
  }
}

/** Главная функция: парсит файл в чистый текст */
export async function parseFile(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new ParseError(
      `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимум — 20 МБ.`
    );
  }

  const format = detectFormat(file.name);
  if (!format) {
    throw new ParseError(
      "Неподдерживаемый формат. Поддерживаются: .docx, .txt, .md"
    );
  }

  let text: string;
  if (format === "docx") {
    text = await readDocx(file);
  } else {
    text = await readAsText(file);
  }

  text = text.replace(/\r\n/g, "\n").replace(/\t/g, "  ").trim();

  if (!text) {
    throw new ParseError("Файл пуст или не содержит читаемого текста.");
  }

  return { name: file.name, text, size: file.size, format };
}

/** Оценка числа слов в строке */
export function countWords(text: string): number {
  const m = text.trim().match(/[a-zа-яё0-9]+(?:[-'][a-zа-яё0-9]+)?/gi);
  return m ? m.length : 0;
}
