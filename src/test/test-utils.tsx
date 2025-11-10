import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

type RenderOptions = {
  route?: string
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const { route = '/' } = options ?? {}
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
