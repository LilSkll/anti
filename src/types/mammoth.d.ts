declare module "mammoth" {
  export interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  /**
   * Извлекает чистый текст из .docx ArrayBuffer.
   * Используется браузерная сборка mammoth.
   */
  export function extractRawText(
    input: ArrayBuffer | Uint8Array | { arrayBuffer: ArrayBuffer }
  ): Promise<ExtractRawTextResult>;

  const _default: {
    extractRawText: typeof extractRawText;
  };
  export default _default;
}

// Браузерная сборка mammoth
declare module "mammoth/mammoth.browser" {
  export interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  export function extractRawText(
    input: ArrayBuffer | Uint8Array
  ): Promise<ExtractRawTextResult>;
  const _default: {
    extractRawText: typeof extractRawText;
  };
  export default _default;
}
