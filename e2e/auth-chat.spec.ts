import { test, expect } from '@playwright/test'

test.describe('Fluxos de autenticacao e chatbot', () => {
  test('usuario consegue registrar nova conta', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-1' }),
      })
    })

    await page.goto('/register')

    await page.getByLabel('Nome Completo').fill('Usuário Teste')
    await page.getByLabel('Email').fill('novo@exemplo.com')
    await page.getByLabel('Senha').fill('Senha@123')
    await page.getByLabel('Confirmar Senha').fill('Senha@123')
    await page.getByRole('button', { name: /criar conta/i }).click()

    await expect(page).toHaveURL(/\/login$/)
  })

  test('usuario faz login e conversa no chatbot', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'token-123', user: { id: 1, name: 'Tester' } }),
      })
    })

    await page.route('**/api/chat/ideas/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ideaId: '1', title: 'Tecnologia', summary: 'App IA' }]),
      })
    })

    await page.route('**/api/chat/start', async (route) => {
      const body = route.request().postDataJSON?.() ?? {}
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: body.ideaId ? 'idea-session' : 'free-session',
          chatType: body.ideaId ? 'IDEA_BASED' : 'FREE',
          tokensRemaining: 10,
        }),
      })
    })

    await page.route('**/api/chat/sessions/**/messages', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          role: 'assistant',
          content: 'Resposta mockada da IA',
          tokensRemaining: 4,
          tokensUsed: 1,
        }),
      })
    })

    await page.route('**/api/chat/sessions/**', async (route) => {
      const isIdea = route.request().url().includes('idea-session')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: isIdea ? 'idea-session' : 'free-session',
          chatType: isIdea ? 'IDEA_BASED' : 'FREE',
          ideaId: isIdea ? '1' : null,
          tokensRemaining: 5,
          messages: [
            {
              id: 'assistant-1',
              role: 'assistant',
              content: isIdea ? 'Selecione sua ideia para continuar.' : 'Pronto para conversar.',
            },
          ],
        }),
      })
    })

    await page.goto('/login')
    await page.getByLabel(/email/i).fill('user@example.com')
    await page.getByLabel(/senha/i).fill('Senha@123')
    await page.getByRole('button', { name: /fazer login/i }).click()

    await expect(page).toHaveURL(/\/generator$/)

    // abre widget e muda para chat ideas
    await page.getByRole('button', { name: /abrir chat/i }).click()
    await page.getByRole('button', { name: /chat ideas/i }).click()

    // seleciona ideia e envia mensagem
    await page.getByRole('button', { name: /tecnologia/i }).click()
    const textarea = page.getByPlaceholder(/pergunta sobre/i)
    await textarea.fill('Quais sao os proximos passos?')
    await page.getByRole('button', { name: /enviar mensagem/i }).click()

    await expect(page.getByText('Resposta mockada da IA')).toBeVisible()
  })
})
