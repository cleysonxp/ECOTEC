import React, { ComponentRef, forwardRef, useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { cores } from '../theme';

type Props = {
  /** De 1 a 3 fotos (URIs locais). */
  fotos: string[];
  largura: number;
  altura: number;
  lacuna?: number;
  raioDaBorda?: number;
  /** Chamado quando todas as fotos terminaram de carregar (momento seguro para capturar a imagem). */
  aoCarregarTudo?: () => void;
};

/**
 * Junta até 3 fotos em um único quadro.
 * A API do EcoTec guarda uma imagem por denúncia; com o mosaico o usuário
 * consegue anexar até 3 fotos (RF05) e o app envia tudo em uma imagem só.
 */
export const Mosaico = forwardRef<ComponentRef<typeof View>, Props>(function Mosaico(
  { fotos, largura, altura, lacuna = 3, raioDaBorda = 0, aoCarregarTudo },
  ref,
) {
  const carregadas = useRef(new Set<string>());
  const assinatura = fotos.join('|');

  useEffect(() => {
    carregadas.current = new Set();
  }, [assinatura]);

  const marcar = (uri: string) => {
    carregadas.current.add(uri);
    if (fotos.every((f) => carregadas.current.has(f))) aoCarregarTudo?.();
  };

  const foto = (uri: string, estilo: object) => (
    <Image
      key={uri}
      source={{ uri }}
      style={[estilos.foto, estilo]}
      resizeMode="cover"
      onLoad={() => marcar(uri)}
      accessibilityIgnoresInvertColors
    />
  );

  let conteudo: React.ReactNode = null;
  if (fotos.length === 1) {
    conteudo = foto(fotos[0], { flex: 1 });
  } else if (fotos.length === 2) {
    conteudo = (
      <View style={[estilos.linha, { gap: lacuna }]}>
        {foto(fotos[0], { flex: 1 })}
        {foto(fotos[1], { flex: 1 })}
      </View>
    );
  } else if (fotos.length >= 3) {
    conteudo = (
      <View style={[estilos.linha, { gap: lacuna }]}>
        {foto(fotos[0], { flex: 3 })}
        <View style={{ flex: 2, gap: lacuna }}>
          {foto(fotos[1], { flex: 1 })}
          {foto(fotos[2], { flex: 1 })}
        </View>
      </View>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{ width: largura, height: altura, backgroundColor: cores.branco, borderRadius: raioDaBorda, overflow: 'hidden' }}
    >
      {conteudo}
    </View>
  );
});

const estilos = StyleSheet.create({
  linha: {
    flex: 1,
    flexDirection: 'row',
  },
  foto: {
    backgroundColor: cores.orvalho,
  },
});
