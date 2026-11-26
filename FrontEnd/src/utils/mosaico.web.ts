import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';

export const QUADRO_DO_MOSAICO = { largura: 360, altura: 270 };

const LARGURA = 1080;
const ALTURA = 810;
const LACUNA = 9;

function carregar(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const imagem = new window.Image();
    imagem.onload = () => resolver(imagem);
    imagem.onerror = () => rejeitar(new Error('Imagem não carregou.'));
    imagem.src = uri;
  });
}

/** Desenha a imagem preenchendo o retângulo, cortando as sobras (igual ao resizeMode "cover"). */
function desenhar(ctx: CanvasRenderingContext2D, imagem: HTMLImageElement, x: number, y: number, l: number, a: number) {
  const escala = Math.max(l / imagem.width, a / imagem.height);
  const lo = l / escala;
  const ao = a / escala;
  ctx.drawImage(imagem, (imagem.width - lo) / 2, (imagem.height - ao) / 2, lo, ao, x, y, l, a);
}

/**
 * Versão para a pré-visualização no navegador: monta o mosaico em um canvas,
 * com o mesmo desenho do componente Mosaico (2 fotos lado a lado; 3 fotos: uma maior e duas empilhadas).
 */
export async function capturarMosaico(_quadro: RefObject<ComponentRef<typeof View> | null>, fotos: string[]): Promise<string | null> {
  try {
    const imagens = await Promise.all(fotos.slice(0, 3).map(carregar));
    const tela = document.createElement('canvas');
    tela.width = LARGURA;
    tela.height = ALTURA;
    const ctx = tela.getContext('2d');
    if (!ctx || imagens.length < 2) return null;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    if (imagens.length === 2) {
      const l = (LARGURA - LACUNA) / 2;
      desenhar(ctx, imagens[0], 0, 0, l, ALTURA);
      desenhar(ctx, imagens[1], l + LACUNA, 0, l, ALTURA);
    } else {
      const esquerda = ((LARGURA - LACUNA) * 3) / 5;
      const direita = LARGURA - LACUNA - esquerda;
      const a = (ALTURA - LACUNA) / 2;
      desenhar(ctx, imagens[0], 0, 0, esquerda, ALTURA);
      desenhar(ctx, imagens[1], esquerda + LACUNA, 0, direita, a);
      desenhar(ctx, imagens[2], esquerda + LACUNA, a + LACUNA, direita, a);
    }
    return tela.toDataURL('image/jpeg', 0.72).split(',')[1] ?? null;
  } catch {
    return null;
  }
}
