import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

// Default timeout in milliseconds
const DEFAULT_REQUEST_TIMEOUT_MS = 25000

/**
 * Server-only validation: Ensure Gemini API key is never accessed on client
 */
function getApiKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: Gemini API client cannot be initialized in client-side code.')
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key-here') {
    throw new Error(
      'Missing GEMINI_API_KEY: Please set GEMINI_API_KEY in your environment variables (.env.local).'
    )
  }

  return apiKey.trim()
}

/**
 * Check if Gemini API key is configured and available (server-side only)
 */
export function isGeminiAvailable(): boolean {
  if (typeof window !== 'undefined') return false
  const apiKey = process.env.GEMINI_API_KEY
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your-gemini-api-key-here')
}

/**
 * Model aliases & replacements for deprecated/retired Gemini model identifiers
 */
const MODEL_MAPPINGS: Record<string, string> = {
  'gemini-1.5-flash': 'gemini-2.5-flash',
  'gemini-1.5-flash-latest': 'gemini-2.5-flash',
  'gemini-1.5-pro': 'gemini-2.5-pro',
}

/**
 * Get configured Generative Model instance
 */
export function getGeminiModel(modelName?: string): GenerativeModel {
  const apiKey = getApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)
  const rawModel = (modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim()
  const selectedModel = MODEL_MAPPINGS[rawModel] || rawModel

  return genAI.getGenerativeModel({
    model: selectedModel,
  })
}

/**
 * Wrapper to execute a Gemini API promise with a hard timeout
 */
export async function executeWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
  operationName: string = 'Gemini AI Request'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timeout: ${operationName} exceeded ${timeoutMs / 1000}s limit.`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([operation, timeoutPromise])
    clearTimeout(timeoutHandle!)
    return result
  } catch (error) {
    clearTimeout(timeoutHandle!)
    throw error
  }
}

/**
 * Safe JSON parser for LLM responses
 * Strips markdown codeblocks (```json ... ```), extra quotes, or trailing characters
 */
export function safeParseGeminiJSON<T>(rawText: string, fallback?: T): T {
  if (!rawText || typeof rawText !== 'string') {
    if (fallback !== undefined) return fallback
    throw new Error('Failed to parse Gemini response: Raw content is empty.')
  }

  let cleaned = rawText.trim()

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '')
    cleaned = cleaned.replace(/\s*```$/i, '')
  }

  // Find boundaries of JSON object or array
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')
  const lastBrace = cleaned.lastIndexOf('}')
  const lastBracket = cleaned.lastIndexOf(']')

  let startIdx = -1
  let endIdx = -1

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace
    endIdx = lastBrace !== -1 ? lastBrace + 1 : cleaned.length
  } else if (firstBracket !== -1) {
    startIdx = firstBracket
    endIdx = lastBracket !== -1 ? lastBracket + 1 : cleaned.length
  }

  if (startIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx)
  }

  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    console.error('JSON parse error on Gemini output:', err, '\nRaw text:\n', rawText)
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(`Failed to parse structured JSON from Gemini response: ${(err as Error).message}`)
  }
}
