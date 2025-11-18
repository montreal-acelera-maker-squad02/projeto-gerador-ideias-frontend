import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import { checkAdminAccess, decodeJWT, getUserRole } from "../jwt"

const toBase64Url = (value: string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

const makeToken = (payload: Record<string, unknown>) => {
  const header = toBase64Url(JSON.stringify({ alg: "none" }))
  const body = toBase64Url(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

const mockFetch = (resolveValue: Partial<Response>) =>
  vi.fn(() => Promise.resolve({ status: 200, ok: true, ...resolveValue }))

describe("jwt utilities", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it("decodes a well-formed token", () => {
    const payload = { sub: "123", authorities: ["ROLE_USER"] }
    const token = makeToken(payload)
    expect(decodeJWT(token)).toEqual(payload)
  })

  it("returns null when token is malformed", () => {
    expect(decodeJWT("invalid.token")).toBeNull()
  })

  it("returns null role when there is no token", async () => {
    expect(await getUserRole()).toBeNull()
  })

  it("returns ADMIN when authorities contain admin role", async () => {
    const token = makeToken({ authorities: ["ROLE_ADMIN"] })
    localStorage.setItem("auth_token", token)
    expect(await getUserRole()).toBe("ADMIN")
  })

  it("defaults to USER when authorities are missing", async () => {
    const token = makeToken({})
    localStorage.setItem("auth_token", token)
    expect(await getUserRole()).toBe("USER")
  })

  it("returns true when checkAdminAccess receives 200", async () => {
    localStorage.setItem("auth_token", "anything")
    const fetchMock = mockFetch({ status: 200 })
    global.fetch = fetchMock

    await expect(checkAdminAccess()).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/admin/logs?size=1",
      expect.objectContaining({
        method: "GET",
        headers: expect.anything(),
        signal: expect.any(Object),
      })
    )
  })

  it("returns false when fetch request fails", async () => {
    localStorage.setItem("auth_token", "anything")
    const rejectMock = vi.fn(() => Promise.reject(new Error("timeout")))
    global.fetch = rejectMock

    await expect(checkAdminAccess()).resolves.toBe(false)
  })

  it("returns false when server responds with non-200", async () => {
    localStorage.setItem("auth_token", "anything")
    const fetchMock = mockFetch({ status: 403, ok: false })
    global.fetch = fetchMock

    await expect(checkAdminAccess()).resolves.toBe(false)
  })
})
