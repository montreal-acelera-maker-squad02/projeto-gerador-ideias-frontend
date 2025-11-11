import { describe, it, expect } from 'vitest'
import { HISTORY_CACHE_KEY } from '../storageKeys'

describe('storageKeys', () => {
  it('exposes the history cache key constant', () => {
    expect(HISTORY_CACHE_KEY).toBe('history_cached_ideas')
  })
})
