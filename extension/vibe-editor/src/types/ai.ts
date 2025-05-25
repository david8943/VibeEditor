export const BrandType = {
  Anthropic: 'Anthropic',
  OpenAI: 'OpenAI',
}
export type BrandType = (typeof BrandType)[keyof typeof BrandType]

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
