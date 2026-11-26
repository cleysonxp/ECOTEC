import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, espaco } from '../theme';
import { BotaoIcone } from './BotaoIcone';
import { CurvasDeNivel } from './CurvasDeNivel';
import { Texto } from './Texto';

type Props = {
  titulo: string;
  subtitulo?: string;
  /** Mostra o botão de voltar (ou fechar) à esquerda. */
  aoVoltar?: () => void;
  iconeVoltar?: 'arrow-left' | 'close';
  rotuloVoltar?: string;
  direita?: React.ReactNode;
  children?: React.ReactNode;
};

/** Cabeçalho verde-mata com as curvas de nível, usado no topo das telas internas. */
export function CabecalhoVerde({
  titulo,
  subtitulo,
  aoVoltar,
  iconeVoltar = 'arrow-left',
  rotuloVoltar = 'Voltar',
  direita,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.area, { paddingTop: insets.top + espaco.xs }]}>
      <CurvasDeNivel />
      <View style={estilos.linha}>
        {aoVoltar ? (
          <BotaoIcone
            icone={iconeVoltar}
            rotulo={rotuloVoltar}
            onPress={aoVoltar}
            cor={cores.branco}
            style={{ marginLeft: -espaco.xs }}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <Texto variante="titulo" cor={cores.branco} accessibilityRole="header" numberOfLines={2}>
            {titulo}
          </Texto>
          {subtitulo ? (
            <Texto variante="apoio" cor={cores.menta}>
              {subtitulo}
            </Texto>
          ) : null}
        </View>
        {direita}
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  area: {
    backgroundColor: cores.mata,
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.md,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    minHeight: 48,
  },
});
