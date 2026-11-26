/** Versão para navegador (pré-visualização): o SecureStore não existe na web. */
export const cofre = {
  async ler(chave: string): Promise<string | null> {
    try {
      return window.sessionStorage.getItem(chave);
    } catch {
      return null;
    }
  },
  async gravar(chave: string, valor: string): Promise<void> {
    try {
      window.sessionStorage.setItem(chave, valor);
    } catch {
      // Armazenamento indisponível: a sessão vale só enquanto a página estiver aberta.
    }
  },
  async apagar(chave: string): Promise<void> {
    try {
      window.sessionStorage.removeItem(chave);
    } catch {
      // Nada a apagar.
    }
  },
};
