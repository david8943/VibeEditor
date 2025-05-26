export const BrandList = ['Anthropic', 'OpenAI'] as const

export type BrandType = (typeof BrandList)[number]

export const BrandName: Record<BrandType, string> = {
  Anthropic: 'Anthropic(Claude)',
  OpenAI: 'OpenAI(ChatGPT)',
}

export interface AIAPIKey {
  brand: BrandType
  apiKey: string
}
export interface AIProvider {
  userAIProviderId: number
  brand: BrandType
  model: string
  isDefault: boolean
}

export interface ChatRequest {
  userAIProviderId: number
  message: string
}
export interface ChatResponse {
  aiResponse: string
}
