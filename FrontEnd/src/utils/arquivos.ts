import { File, Paths } from 'expo-file-system';
import { extensaoDeVideoBase64 } from './midia';

/** Lê um arquivo local (foto ou vídeo escolhido pelo usuário) como texto base64, formato que a API espera. */
export async function lerArquivoEmBase64(uri: string): Promise<string> {
  return new File(uri).base64();
}

/** Tamanho do arquivo em bytes, ou null se não for possível ler. */
export function tamanhoDoArquivo(uri: string): number | null {
  try {
    const arquivo = new File(uri);
    return arquivo.exists ? arquivo.size : null;
  } catch {
    return null;
  }
}

/**
 * A API devolve o vídeo em base64. Para reproduzir, o app grava o conteúdo
 * em um arquivo temporário (pasta de cache) e entrega o caminho ao tocador.
 */
export async function salvarVideoTemporario(idDenuncia: number, base64: string): Promise<string> {
  const arquivo = new File(Paths.cache, `ecotec-denuncia-${idDenuncia}.${extensaoDeVideoBase64(base64)}`);
  if (arquivo.exists) arquivo.delete();
  arquivo.create();
  arquivo.write(base64, { encoding: 'base64' });
  return arquivo.uri;
}
