# AI Linguistic Discourse Analyzer

**Платформа для исследования языковой коммуникации человека и искусственного интеллекта на основе методов лингвистики, дискурс-анализа и семиотики.**

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## Возможности

| Модуль | Описание |
|--------|----------|
| **Анализ текста** | 9 количественных метрик (0–100): авторство, формальность, эмоциональность, когезия, когерентность и др. Радар-диаграмма + кольцевой график. |
| **Языковые маркеры** | Автоматическое выделение 6 типов маркеров с цветовой подсветкой текста: шаблоны, клише, повторы, нейтральные формулировки, признаки ИИ/человека. |
| **Дискурс-анализ** | Коммуникативная цель, тип дискурса, речевая стратегия/тактика, аудитория, модальность, регистр. |
| **Семиотический анализ** | Интерактивная графовая карта (React Flow): ключевые концепты, знаки, семантические поля и их связи. |
| **Сравнение текстов** | Попарное сопоставление: сходство дискурса, терминологии, синтаксиса и стратегий с графиками. |
| **Научные отчёты** | Автоформирование отчёта с экспортом в PDF и DOCX. |

## Поддерживаемые LLM-провайдеры

- **OpenAI** — GPT-4o, GPT-4o-mini
- **Google Gemini** — Gemini 2.0 Flash, Gemini 1.5 Pro
- **GroqCloud** — Llama 3.3 70B, Llama 3.1 8B

Все запросы идут **напрямую из браузера** по HTTPS. API-ключи хранятся только в `localStorage`. Backend не используется.

## Технологии

- **React 18 + TypeScript** — UI и типобезопасность
- **Vite** — сборка и dev-server
- **Tailwind CSS** — стилизация
- **Zustand** — state management (persist в localStorage)
- **Chart.js + react-chartjs-2** — радар, донат, бары
- **@xyflow/react (React Flow)** — граф семиотического анализа
- **jsPDF + docx** — клиентский экспорт документов
- **Lucide React** — иконки

## Запуск

```bash
# Клонировать
git clone https://github.com/LilSkll/anti.git
cd anti

# Установить зависимости
npm install

# Дев-сервер
npm run dev

# Production-сборка
npm run build
npm run preview
```

## Развертывание на Vercel

1. Подключите репозиторий `LilSkll/anti` в [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables — **не нужны**. API-ключи пользователь вводит в UI.

`vercel.json` уже настроен для SPA-роутинга.

## Структура проекта

```
src/
├── App.tsx                          # Роутинг (6 страниц)
├── main.tsx                          # Точка входа
├── index.css                         # Tailwind + тема
├── types/analysis.ts                 # Все TypeScript-интерфейсы
├── store/
│   ├── settingsStore.ts              # API-ключи, провайдер, модель
│   └── analysisStore.ts              # История анализов
├── lib/
│   ├── providers/{openai,gemini,groq} # LLM-провайдеры
│   ├── prompts/{text,markers,…}      # Системные промпты
│   ├── analyze.ts                    # Оркестратор анализа
│   ├── highlight.ts                  # Подсветка маркеров
│   ├── export/{pdf,docx}.ts          # Генерация документов
│   └── metrics.ts                    # Описатели метрик
├── components/
│   ├── layout/                       # Sidebar + Layout
│   ├── ui/                           # Card, Button, Badge, ScoreGauge…
│   ├── charts/                       # Radar, Donut, ComparisonBar
│   ├── analysis/                     # MetricCard, HighlightedText…
│   └── semiotic/                     # SemioticGraph (React Flow)
└── pages/                           # 6 страниц приложения
```

## Лицензия

MIT
