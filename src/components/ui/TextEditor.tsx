import { useRef, useState, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile, ParseError, countWords } from "@/lib/fileParser";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Минимальная высота textarea в px */
  minHeight?: number;
  /** Заглушка */
  placeholder?: string;
  /** Подпись поля (для варианта с двумя колонками — напр. "Текст A") */
  label?: string;
  /** Точечный цвет-индикатор (для сравнения) */
  dotColor?: "cyan" | "violet";
  /** Показывать кнопку загрузки файла */
  allowUpload?: boolean;
}

export function TextEditor({
  value,
  onChange,
  minHeight = 220,
  placeholder = "Вставьте текст или загрузите документ…",
  label,
  dotColor,
  allowUpload = true,
}: TextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const words = countWords(value);
  const chars = value.length;

  const handleFile = useCallback(
    async (file: File) => {
      setFileError(null);
      setLoadingFile(true);
      try {
        const parsed = await parseFile(file);
        onChange(parsed.text);
        setFileName(parsed.name);
      } catch (e) {
        const msg =
          e instanceof ParseError
            ? e.message
            : "Не удалось обработать файл.";
        setFileError(msg);
        setFileName(null);
      } finally {
        setLoadingFile(false);
      }
    },
    [onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // сброс, чтобы можно было загрузить тот же файл повторно
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      {/* Заголовок + инструменты */}
      <div className="flex items-center justify-between">
        {label ? (
          <span className="label-base mb-0 flex items-center gap-2">
            {dotColor && (
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  dotColor === "cyan" ? "bg-accent-cyan" : "bg-accent-violet"
                )}
              />
            )}
            {label}
          </span>
        ) : (
          <span className="label-base mb-0">Исходный текст</span>
        )}

        <div className="flex items-center gap-3">
          {fileName && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileText className="h-3.5 w-3.5 text-accent-emerald" />
              <span className="max-w-[160px] truncate">{fileName}</span>
              <button
                onClick={() => {
                  setFileName(null);
                }}
                className="text-slate-500 hover:text-slate-300"
                aria-label="Очистить файл"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <span className="font-mono text-xs text-slate-500">
            {words} слов · {chars.toLocaleString("ru-RU")} симв.
          </span>
        </div>
      </div>

      {/* Контейнер textarea + drag&drop overlay */}
      <div
        className={cn(
          "relative rounded-xl border bg-ink-850/70 transition",
          dragOver
            ? "border-accent-cyan ring-2 ring-accent-cyan/30"
            : "border-white/10"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full resize-y rounded-xl bg-transparent px-3.5 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 outline-none"
          style={{ minHeight }}
          spellCheck={false}
        />

        {/* Drag overlay */}
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-accent-cyan/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-cyan">
              <UploadCloud className="h-5 w-5" />
              Отпустите файл здесь
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loadingFile && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-ink-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-accent-cyan">
              <Loader2 className="h-4 w-4 animate-spin" />
              Чтение документа…
            </div>
          </div>
        )}
      </div>

      {/* Ошибка */}
      {fileError && (
        <div className="flex items-start gap-2 rounded-lg border border-accent-rose/30 bg-accent-rose/10 p-2.5 text-xs text-accent-rose">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Кнопки */}
      {allowUpload && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent-cyan/40 hover:bg-accent-cyan/[0.06] hover:text-accent-cyan"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Загрузить .docx / .txt
          </button>
          <span className="text-[11px] text-slate-500">
            или перетащите файл в поле выше
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt,.md,.markdown"
            onChange={onInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

// Ре-экспорт для удобства
export { countWords };
