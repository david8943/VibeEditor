'use client'

import { PropsWithChildren, useEffect } from 'react'
import { Provider } from 'react-redux'

import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

import ErrorModal from '@/components/ErrorModal'
import { store } from '@/store/store'

import { EmotionProvider } from './emotionProvider'
import { I18nProvider } from './i18nProvider'

function LoadingFallback() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('ServiceWorker 등록 성공:', registration)
        },
        (err) => {
          console.error('ServiceWorker 등록 실패:', err)
        },
      )
    }
  }, [])
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100dvh',
        width: '100%',
      }}>
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '60%',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto',
          width: '100%',
          overflowY: 'auto',
        }}>
        <img
          src="/icons/new/loading.svg"
          alt="logo"
          width={100}
          height={100}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'var(--font-paperlogy-medium)',
            color: 'var(--color-text-regular)',
            gap: '10px',
          }}>
          'VIBE EDITOR'
          {/* <img
            src="/icons/new/logo-icon.svg"
            alt="logo"
            width={100}
            height={20}
          /> */}
          <p
            style={{
              color: '#586575',
            }}>
            AI로 작성하는 기술 블로그 VSCode Extension
          </p>
        </div>
      </div>
    </div>
  )
}

export function Providers({ children }: PropsWithChildren) {
  const persistor = persistStore(store)

  return (
    <EmotionProvider>
      <Provider store={store}>
        <PersistGate
          loading={<LoadingFallback />}
          persistor={persistor}>
          <ErrorModal />
          <I18nProvider>{children}</I18nProvider>
        </PersistGate>
      </Provider>
    </EmotionProvider>
  )
}
