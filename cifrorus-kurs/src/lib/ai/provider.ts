// ============================================================
// Провайдер ИИ и вызов модели (перенесено из «ДиагКомп-Рус»)
// Переключение Anthropic/Claude ↔ Google/Gemini через ENV AI_PROVIDER.
// По умолчанию — Gemini (gemini-2.5-flash), как настроено в проекте.
// ============================================================

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'

export type AIProvider = 'anthropic' | 'gemini'

export const ANTHROPIC_MODEL = 'claude-sonnet-5'
export const GEMINI_MODEL = 'gemini-2.5-flash'

export function activeProvider(): AIProvider {
  // По умолчанию Gemini; чтобы вернуться на Claude — AI_PROVIDER=anthropic
  return process.env.AI_PROVIDER === 'anthropic' ? 'anthropic' : 'gemini'
}

export function modelFor(provider: AIProvider): string {
  return provider === 'anthropic' ? ANTHROPIC_MODEL : GEMINI_MODEL
}

// Клиенты создаём лениво — нужен только выбранный провайдер
let _anthropic: Anthropic | null = null
function anthropicClient() {
  return (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
}
let _genai: GoogleGenAI | null = null
function genaiClient() {
  return (_genai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }))
}

// Возвращает сырой JSON-текст оценки от выбранной модели.
// schema — JSON Schema для structured outputs (используется Anthropic).
export async function callModel(
  provider: AIProvider,
  model: string,
  system: string,
  userPrompt: string,
  schema: Record<string, unknown>,
): Promise<string> {
  if (provider === 'gemini') {
    const resp = await genaiClient().models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: system,
        responseMimeType: 'application/json',
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 }, // оценивание — не творческая задача
      },
    })
    return resp.text ?? ''
  }

  // Anthropic / Claude
  const message = await anthropicClient().messages.create({
    model,
    max_tokens: 2000,
    system,
    thinking: { type: 'disabled' },
    output_config: { format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: userPrompt }],
  })
  const raw = message.content.find(b => b.type === 'text')
  return raw && raw.type === 'text' ? raw.text : ''
}
