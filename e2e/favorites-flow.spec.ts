import { test, expect } from '@playwright/test'

test.describe('FavoritesPage E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 🔹 Mock da rota de listagem de ideias
    await page.route('**/api/ideas**', async (route) => {
      const ideas = [
        {
          id: '1',
          theme: 'Tecnologia',
          context: 'IA',
          content: 'Ideia Incrível',
          timestamp: new Date().toISOString(),
          isFavorite: false,
        },
        {
          id: '2',
          theme: 'Educação',
          context: 'Estudos',
          content: 'Ideia Educacional',
          timestamp: new Date().toISOString(),
          isFavorite: false,
        },
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ideas),
      })
    })

    // 🔹 Mock da rota de favoritos (começa vazio)
    let favorites: any[] = []

    await page.route('**/api/favorites**', async (route) => {
      if (route.request().method() === 'GET') {
        // Retorna os favoritos atuais
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(favorites),
        })
      }

      if (route.request().method() === 'POST') {
        // Simula favoritar uma ideia
        const body = await route.request().postDataJSON()
        const favorited = {
          id: body.id,
          theme: body.theme,
          context: body.context,
          content: body.content,
          timestamp: new Date().toISOString(),
          isFavorite: true,
        }
        favorites.push(favorited)
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      }

      return route.continue()
    })
  })

  test('favorita uma ideia e exibe na página de favoritos', async ({ page }) => {
    // 🔸 Vai para a página principal onde as ideias são renderizadas
    await page.goto('/')

    // Espera carregar cards
    const firstCard = page.getByRole('article').first()
    await expect(firstCard).toBeVisible()

    // Clica no botão de favoritar do primeiro card
    const favButton = firstCard.getByRole('button', { name: /favoritar/i })
    await favButton.click()

    // Navega até a página de favoritos
    await page.getByRole('link', { name: /favoritos/i }).click()
    await expect(page).toHaveURL(/favorites/i)

    // Verifica se a ideia favoritada aparece na lista
    await expect(page.getByText(/Ideia Incrível/i)).toBeVisible()
  })
})
