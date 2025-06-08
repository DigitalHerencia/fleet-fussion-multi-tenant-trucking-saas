// Ensure this file is treated as an ES module. See Vitest docs if you encounter import errors.
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '../lib/utils/utils';

describe('formatDate', () => {
  it('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('formatCurrency', () => {
  it('returns $0.00 for NaN', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
  });
});
