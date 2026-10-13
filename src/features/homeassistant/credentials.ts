import * as SecureStore from 'expo-secure-store';

/**
 * The Home Assistant token lives only in the platform keychain (iOS) /
 * keystore (Android), never in SQLite, logs or the JS bundle.
 */
const TOKEN_KEY = 'homeos.ha.token';

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* nothing stored */
  }
}
