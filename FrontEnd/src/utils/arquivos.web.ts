/** Versões para a pré-visualização no navegador. */

export async function lerArquivoEmBase64(uri: string): Promise<string> {
  const resposta = await fetch(uri);
  const blob = await resposta.blob();
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onerror = () => rejeitar(new Error('Não foi possível ler o arquivo.'));
    leitor.onload = () => resolver(String(leitor.result).split(',')[1] ?? '');
    leitor.readAsDataURL(blob);
  });
}

export function tamanhoDoArquivo(_uri: string): number | null {
  return null;
}

export async function salvarVideoTemporario(_idDenuncia: number, base64: string): Promise<string> {
  return `data:video/mp4;base64,${base64}`;
}
