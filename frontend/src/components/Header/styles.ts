/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'

export const StyledIconButton = styled.div`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  user-select: none;

  &:hover {
    opacity: 0.6;
  }

  &:active {
    opacity: 0.4;
  }

  &:focus {
    opacity: 1;
  }
`
export const HeaderContainer = styled.div`
  padding: 20px 16px 50px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ theme }) => theme.typography.styles.title};
  color: ${({ theme }) => theme.color.text.regular};
`

export const HeaderButton = styled.button`
  padding: 16px 8px;
  border-radius: 16px;
  border: none;
  display: inline-flex;
  text-align: center;

  color: ${({ theme }) => theme.color.primary};
  ${({ theme }) => theme.typography.styles.button};
  cursor: pointer;
  outline: none;

  &:focus {
    opacity: 1;
  }
  &:hover {
    opacity: 0.5;
    transform: scale(1.05);
    transition:
      opacity 0.3s ease,
      transform 0.1s ease;
  }
`
