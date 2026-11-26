import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { LADO_MAXIMO_FOTO, QUALIDADE_FOTO } from './midia';

export type FotoPronta = {
  /** Arquivo JPEG local, já reduzido. */
  uri: string;
  base64: string;
  largura: number;
  altura: number;
};

/** Remove quebras de linha que algumas plataformas inserem no base64 (o back-end .NET não as aceita). */
export function limparBase64(base64: string): string {
  return /\s/.test(base64) ? base64.replace(/\s+/g, '') : base64;
}

/**
 * Reduz a foto para no máximo 1080 px no lado maior e converte para JPEG.
 * Fotos de celular têm vários megabytes; como o feed traz as imagens junto com a lista,
 * manter cada uma leve é o que garante o carregamento rápido (RNF01).
 */
export async function prepararFoto(uri: string, largura?: number, altura?: number): Promise<FotoPronta> {
  const contexto = ImageManipulator.manipulate(uri);
  if (largura && altura) {
    if (Math.max(largura, altura) > LADO_MAXIMO_FOTO) {
      contexto.resize(largura >= altura ? { width: LADO_MAXIMO_FOTO } : { height: LADO_MAXIMO_FOTO });
    }
  } else {
    contexto.resize({ width: LADO_MAXIMO_FOTO });
  }
  const imagem = await contexto.renderAsync();
  const salva = await imagem.saveAsync({ compress: QUALIDADE_FOTO, format: SaveFormat.JPEG, base64: true });
  return { uri: salva.uri, base64: limparBase64(salva.base64 ?? ''), largura: salva.width, altura: salva.height };
}
