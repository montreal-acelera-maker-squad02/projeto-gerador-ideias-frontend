export function getAuthToken(): string | null {
  try {
    const fromStorage = window?.localStorage?.getItem('auth_token')
    if (fromStorage) return fromStorage
  } catch {}
  return null
}

export function setAuthToken(token: string) {
  try {
    window?.localStorage?.setItem('auth_token', token)
  } catch {}
}

export function clearAuthToken() {
  try {
    window?.localStorage?.removeItem('auth_token')
  } catch {}
}

export async function apiFetch(input: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  const token = getAuthToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  return fetch(input, { ...init, headers, credentials: 'include' })
}

