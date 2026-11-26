/** Regras e utilitários para fotos e vídeos das denúncias (RF05, RF06 e RNF08). */

export const MAX_FOTOS = 3;
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024; // 30 MB (RF06)
export const MAX_VIDEO_SEGUNDOS = 30;
export const FORMATOS_DE_VIDEO = ['mp4', 'mov', 'm4v'];
export const FORMATOS_DE_FOTO = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'];

/** Lado maior, em pixels, das fotos enviadas (mantém o feed leve - RNF01). */
export const LADO_MAXIMO_FOTO = 1080;
export const QUALIDADE_FOTO = 0.7;

export function extensaoDoArquivo(nomeOuUri?: string | null): string {
  if (!nomeOuUri) return '';
  const semQuery = nomeOuUri.split('?')[0];
  const ponto = semQuery.lastIndexOf('.');
  return ponto >= 0 ? semQuery.slice(ponto + 1).toLowerCase() : '';
}

/** A API devolve a imagem em base64, sem o tipo. O tipo é descoberto pelos primeiros bytes. */
export function uriDeImagemBase64(base64?: string | null): string | null {
  if (!base64) return null;
  let tipo = 'image/jpeg';
  if (base64.startsWith('iVBOR')) tipo = 'image/png';
  else if (base64.startsWith('R0lG')) tipo = 'image/gif';
  else if (base64.startsWith('UklGR')) tipo = 'image/webp';
  return `data:${tipo};base64,${base64}`;
}

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decodifica só o começo de um texto base64 (o suficiente para ler o cabeçalho do arquivo). */
function primeirosBytes(base64: string, quantos: number): number[] {
  const bytes: number[] = [];
  for (let i = 0; i + 3 < base64.length && bytes.length < quantos; i += 4) {
    const n =
      (ALFABETO.indexOf(base64[i]) << 18) |
      (ALFABETO.indexOf(base64[i + 1]) << 12) |
      ((ALFABETO.indexOf(base64[i + 2]) & 63) << 6) |
      (ALFABETO.indexOf(base64[i + 3]) & 63);
    bytes.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  return bytes.slice(0, quantos);
}

/**
 * Vídeos gravados no iPhone costumam ser QuickTime (.mov); os demais, MP4.
 * Nos dois formatos, os bytes 8 a 11 do arquivo trazem a "marca" do contêiner ("qt  " no QuickTime).
 */
export function extensaoDeVideoBase64(base64: string): 'mov' | 'mp4' {
  const marca = String.fromCharCode(...primeirosBytes(base64, 12).slice(8, 12));
  return marca === 'qt  ' ? 'mov' : 'mp4';
}

/** Tamanho aproximado, em bytes, do conteúdo representado por um texto base64. */
export function bytesDoBase64(base64: string): number {
  return Math.floor((base64.length * 3) / 4);
}
