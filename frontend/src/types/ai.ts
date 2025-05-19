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
