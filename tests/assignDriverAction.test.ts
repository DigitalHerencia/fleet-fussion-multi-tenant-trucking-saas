import { describe, it, expect } from 'vitest';
import { assignDriverAction } from '@/lib/actions/dispatchActions';

describe('assignDriverAction', () => {
  it('fails validation with missing data', async () => {
    const res = await assignDriverAction({
      driverId: '',
      vehicleId: '',
      loadId: '',
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
