import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento seguro do aparelho (Keychain no iOS, Keystore no Android).
 * Guarda o token JWT e os dados da sessão.
 */
export const cofre = {
  async ler(chave: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(chave);
    } catch {
      return null;
    }
  },
  async gravar(chave: string, valor: string): Promise<void> {
    await SecureStore.setItemAsync(chave, valor);
  },
  async apagar(chave: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(chave);
    } catch {
      // Nada a apagar.
    }
  },
};
