import { describe, expect, it, vi, beforeEach } from 'vitest'
import { authService } from '../authService'
import axios from 'axios'

vi.mock('axios')

const axiosMock = vi.mocked(axios)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('authService additional coverage', () => {
  it('register envia dados e retorna resposta', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { accessToken: 'a', refreshToken: 'r' } })
    const response = await authService.register('Usuário', 'user@example.com', 'Senha1!', 'Senha1!')
    expect(axiosMock.post).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
      name: 'Usuário',
      email: 'user@example.com',
    }))
    expect(response.accessToken).toBe('a')
  })

  it('login e refresh retornam dados', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: { accessToken: 'a1', refreshToken: 'r1' } })
    await authService.login('u', 'p')
    expect(axiosMock.post).toHaveBeenCalledWith('/api/auth/login', { email: 'u', password: 'p' })

    axiosMock.post.mockResolvedValueOnce({ data: { accessToken: 'a2', refreshToken: 'r2' } })
    await authService.refreshToken('refresh1')
    expect(axiosMock.post).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'refresh1' })
  })

  it('logout adiciona header e ignora erro', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    axiosMock.post.mockResolvedValueOnce({ data: {} })
    await authService.logout('refresh')
    expect(axiosMock.post).toHaveBeenCalledWith(
      '/api/auth/logout',
      { refreshToken: 'refresh' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }),
      })
    )

    axiosMock.post.mockRejectedValueOnce(new Error('bad'))
    await authService.logout()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
