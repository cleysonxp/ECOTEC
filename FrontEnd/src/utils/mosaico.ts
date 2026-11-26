import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { limparBase64 } from './fotos';

/** Tamanho, em pontos, do quadro usado para montar o mosaico (proporção 4:3). */
export const QUADRO_DO_MOSAICO = { largura: 360, altura: 270 };

/** Uma imagem real de 1080 x 810 nunca fica tão pequena; abaixo disso a captura saiu em branco. */
const TAMANHO_MINIMO = 16000;

/**
 * Transforma o quadro do mosaico (até 3 fotos lado a lado) em uma única imagem JPEG em base64.
 * Devolve null se a captura falhar; quem chama decide o que fazer (enviar só a primeira foto).
 * `_fotos` só é usado na versão para navegador (mosaico.web.ts), que desenha o mosaico em um canvas.
 */
export async function capturarMosaico(quadro: RefObject<ComponentRef<typeof View> | null>, _fotos: string[]): Promise<string | null> {
  const opcoes = { format: 'jpg', quality: 0.72, result: 'base64', width: 1080, height: 810 } as const;
  try {
    let base64 = limparBase64(await captureRef(quadro, opcoes));
    if (base64.length < TAMANHO_MINIMO) {
      // Segunda tentativa com outro método de renderização do iOS.
      base64 = limparBase64(await captureRef(quadro, { ...opcoes, useRenderInContext: true }));
    }
    return base64.length >= TAMANHO_MINIMO ? base64 : null;
  } catch {
    return null;
  }
}
