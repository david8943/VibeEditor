import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { SignUpRequest, SocialLogin } from '@/types/auth'
import { CreateDatabase } from '@/types/database'

interface AuthState {
  FCMToken: string | null
  loginToken: SocialLogin
  signUpRequest: SignUpRequest
  notionRequest: {
    notionSecretKey: string | null
    notionDatabaseName: string | null
    notionDatabaseUid: string | null
  }
}

const initialState: AuthState = {
  FCMToken: null,
  loginToken: {
    accessToken: null,
    expiresIn: null,
    refreshToken: null,
  },
  signUpRequest: {
    userName: 'test10',
    email: 'test10@test.com',
    providerName: '',
    providerUid: 'string',
  },
  notionRequest: {
    notionSecretKey: null,
    notionDatabaseName: null,
    notionDatabaseUid: null,
  },
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.loginToken.accessToken = action.payload
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.loginToken.refreshToken = action.payload
    },
    setExpiresIn: (state, action: PayloadAction<number>) => {
      state.loginToken.expiresIn = action.payload
    },
    clearTokens: (state) => {
      Object.assign(state, initialState)
    },
    setFCMToken: (state, action: PayloadAction<string>) => {
      state.FCMToken = action.payload
    },
    setSignUpEmail: (state, action: PayloadAction<string>) => {
      state.signUpRequest.email = action.payload
    },
    setSignUpName: (state, action: PayloadAction<string>) => {
      state.signUpRequest.userName = action.payload
    },
    setSignUpProviderName: (state, action: PayloadAction<string>) => {
      state.signUpRequest.providerName = action.payload
    },
    setSignUpProviderUid: (state, action: PayloadAction<string>) => {
      state.signUpRequest.providerUid = action.payload
    },
    setSignUpNotionSecretKey: (state, action: PayloadAction<string>) => {
      state.notionRequest.notionSecretKey = action.payload
    },
    setSignUpNotionDatabaseName: (state, action: PayloadAction<string>) => {
      state.notionRequest.notionDatabaseName = action.payload
    },
    setSignUpNotionDatabaseUid: (state, action: PayloadAction<string>) => {
      state.notionRequest.notionDatabaseUid = action.payload
    },
    setSignUpNotionDatabase: (state, action: PayloadAction<CreateDatabase>) => {
      state.notionRequest.notionDatabaseName = action.payload.notionDatabaseName
      state.notionRequest.notionDatabaseUid = action.payload.notionDatabaseUid
    },
    clearSignUp: (state) => {
      Object.assign(state, initialState)
    },
  },
})

export const {
  setAccessToken,
  setRefreshToken,
  setExpiresIn,
  setFCMToken,
  clearTokens,
  setSignUpEmail,
  setSignUpName,
  clearSignUp,
  setSignUpProviderName,
  setSignUpProviderUid,
  setSignUpNotionSecretKey,
  setSignUpNotionDatabaseName,
  setSignUpNotionDatabaseUid,
  setSignUpNotionDatabase,
} = authSlice.actions

export default authSlice.reducer
