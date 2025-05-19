import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { resetStore } from '@/store/store'

import { HeaderButton, HeaderContainer } from './styles'

type HeaderProps = {
  isLogin: boolean
}

export const Header = ({ isLogin }: HeaderProps) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const logouted = useRef(false)

  const handleLogout = async () => {
    if (logouted.current) return
    logouted.current = true
    dispatch(resetStore())
  }

  return (
    <HeaderContainer>
      <div>
        <HeaderButton onClick={() => router.push('/onboarding')}>
          <Image
            src="/icons/new/logo-icon.svg"
            alt="logo"
            width={24}
            height={24}
          />
          Vibe Editor
        </HeaderButton>
        {!isLogin && false && (
          <>
            <HeaderButton onClick={() => router.push('/auth/signup')}>
              회원가입
            </HeaderButton>
            <HeaderButton onClick={() => router.push('/auth/login')}>
              로그인
            </HeaderButton>
          </>
        )}
        {isLogin && false && (
          <>
            <HeaderButton onClick={handleLogout}>로그아웃</HeaderButton>
            <HeaderButton onClick={() => router.push('/auth/post/create')}>
              미리보기
            </HeaderButton>
            <HeaderButton onClick={() => router.push('/my')}>설정</HeaderButton>
          </>
        )}
        <HeaderButton
          onClick={() =>
            router.push(
              'https://marketplace.visualstudio.com/items?itemName=VibeEditor.vibe-editor',
            )
          }>
          vscode extension 바로가기
        </HeaderButton>
      </div>
    </HeaderContainer>
  )
}
