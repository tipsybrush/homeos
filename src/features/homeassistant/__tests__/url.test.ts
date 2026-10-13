import { HAError } from '../types';
import { insecureRemoteWarning, normalizeBaseUrl, toWebSocketUrl, validateToken } from '../url';

describe('normalizeBaseUrl', () => {
  it('adds a scheme and strips trailing slashes and /api', () => {
    expect(normalizeBaseUrl('homeassistant.local:8123')).toBe('http://homeassistant.local:8123');
    expect(normalizeBaseUrl(' http://192.168.1.20:8123/api/ ')).toBe('http://192.168.1.20:8123');
  });

  it('rejects empty, non-http and credential-bearing addresses', () => {
    expect(() => normalizeBaseUrl('')).toThrow(HAError);
    expect(() => normalizeBaseUrl('ftp://x')).toThrow(/http/);
    expect(() => normalizeBaseUrl('http://user:pass@ha.local')).toThrow(/password/);
  });

  it('derives the websocket url', () => {
    expect(toWebSocketUrl('https://ha.example.com')).toBe('wss://ha.example.com/api/websocket');
    expect(toWebSocketUrl('http://10.0.0.5:8123')).toBe('ws://10.0.0.5:8123/api/websocket');
  });

  it('warns only for unencrypted remote addresses', () => {
    expect(insecureRemoteWarning('http://192.168.1.20:8123')).toBeNull();
    expect(insecureRemoteWarning('http://homeassistant.local:8123')).toBeNull();
    expect(insecureRemoteWarning('https://ha.example.com')).toBeNull();
    expect(insecureRemoteWarning('http://ha.example.com')).toMatch(/unencrypted/);
  });

  it('validates tokens', () => {
    expect(validateToken('  abc.def  ')).toBe('abc.def');
    expect(() => validateToken('')).toThrow(HAError);
    expect(() => validateToken('abc def')).toThrow(/spaces/);
  });
});
