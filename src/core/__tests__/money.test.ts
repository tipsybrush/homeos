import { formatNaira, parseNairaInput } from '../money';

describe('money', () => {
  it('stores naira as integer kobo', () => {
    expect(parseNairaInput('2,500')).toBe(250000);
    expect(parseNairaInput('₦1500.50')).toBe(150050);
    expect(parseNairaInput('')).toBeNull();
    expect(parseNairaInput('abc')).toBeNaN();
  });

  it('never formats an unknown price as zero', () => {
    expect(formatNaira(null)).toBe('Price not set');
    expect(formatNaira(250000)).toMatch(/2,500/);
  });
});
