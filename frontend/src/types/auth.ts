export interface SocialLogin {
  accessToken: string | null
  expiresIn: number | null
  refreshToken: string | null
}

export interface LoginRequest {
  emailAddress: string
  password: string
}

export interface SignUpRequest {
  userName: string
  email: string
  providerName: string
  providerUid: string
}
