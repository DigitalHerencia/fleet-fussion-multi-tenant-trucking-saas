import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency } from '../lib/utils/utils'

describe('utils', () => {
  it('formats date to YYYY-MM-DD', () => {
    expect(formatDate('2024-05-20T00:00:00Z')).toBe('2024-05-20')
  })

  it('formats currency in USD', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })
})
