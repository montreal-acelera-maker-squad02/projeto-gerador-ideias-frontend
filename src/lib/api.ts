export function getAuthToken(): string | null {
  // 1) Variável de ambiente em tempo de build (útil para dev)
  const fromEnv = (import.meta as any).env?.VITE_API_TOKEN as string | undefined
  if (fromEnv && fromEnv !== 'undefined' && fromEnv !== 'null') return fromEnv
  // 2) LocalStorage (útil para sessão do usuário)
  try {
    const fromStorage = window?.localStorage?.getItem('auth_token')
    if (fromStorage) return fromStorage
  } catch {}
  return null
}

export async function apiFetch(input: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  return fetch(input, { ...init, headers })
}

