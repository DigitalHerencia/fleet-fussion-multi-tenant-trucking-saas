const vitest = await import('vitest');
const { describe, it, expect } = vitest;
import { assignDriverAction } from '@/lib/actions/dispatchActions';

describe('assignDriverAction', () => {
  it('fails validation with missing data', async () => {
    await expect(assignDriverAction({
      driverId: '',
      vehicleId: '',
      loadId: ''
    })).rejects.toThrow();
  });
});
