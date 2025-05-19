import styled from '@emotion/styled'

export const Main = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-height: 60%;
  margin: auto;
  width: 100%;
`
export const HeaderContainer = styled.div`
  padding: 20px 16px 50px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.typography.styles.title};
  color: ${({ theme }) => theme.color.text.regular};
`

export const ImageContainer = styled.div`
  position: relative;
  height: 50dvh;
  display: flex;
  flex: 1;
  width: 100%;
  > div:nth-child(1) {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  > div:nth-child(2) {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
  }
  > div:nth-child(3) {
    position: absolute;
    left: 50%;
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
export const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const LittleTitle = styled.h1`
  color: ${({ theme }) => theme.color.text.regular};
  font-family: var(--font-paperlogy-semi-bold);
  font-size: 1.625rem;
  white-space: pre-line;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.2s ease-out forwards;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

export const StepControl = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`

export const Dot = styled.button<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ active }) => (active ? '#4A90E2' : '#ccc')};
  border: none;
  cursor: pointer;
  transition: background 0.3s;
`

export const MarkdownViewer = styled.div`
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;

  h1,
  h2,
  h3 {
    margin-top: 1em;
    font-weight: bold;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.17em;
  }

  pre {
    background-color: #f6f8fa;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.25rem;
  }

  code {
    background-color: #f0f0f0;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }
`
