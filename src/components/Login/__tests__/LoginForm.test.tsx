import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import { renderWithProviders, createChatContextValue } from '@/test/test-utils'
import { authService } from '@/services/authService'
import { setAuthToken } from '@/lib/api'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  setAuthToken: vi.fn(),
}))

const loginMock = vi.mocked(authService.login)

describe('LoginForm', () => {
  const chatContext = createChatContextValue()
  let storageSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockNavigate.mockReset()
    loginMock.mockReset()
    storageSpy = vi.spyOn(Storage.prototype, 'setItem')
  })

  afterEach(() => {
    storageSpy.mockRestore()
  })

  it('realiza login com sucesso e salva token', async () => {
    loginMock.mockResolvedValue({
      token: 'abc123',
      user: { id: 42, name: 'Tester' },
    })
    const preloadSpy = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<LoginForm />, {
      chatContext: createChatContextValue({ preload: preloadSpy }),
    })

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/seu@email/i), 'user@example.com')
    await user.type(screen.getByPlaceholderText(/\*\*\*\*\*\*\*\*/i), 'Senha@123')

    await user.click(screen.getByRole('button', { name: /fazer login/i }))

    expect(loginMock).toHaveBeenCalledWith('user@example.com', 'Senha@123')
    expect(setAuthToken).toHaveBeenCalledWith('abc123')
    expect(storageSpy).toHaveBeenCalledWith('token', 'abc123')
    expect(preloadSpy).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/generator')
  })

  it('exibe alerta quando o login falha', async () => {
    loginMock.mockRejectedValue(new Error('invalid'))
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    renderWithProviders(<LoginForm />, { chatContext })

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/seu@email/i), 'user@example.com')
    await user.type(screen.getByPlaceholderText(/\*\*\*\*\*\*\*\*/i), 'senha')

    await user.click(screen.getByRole('button', { name: /fazer login/i }))

    expect(alertMock).toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
