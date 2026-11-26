import React from 'react';
import { Text, TextProps } from 'react-native';
import { cores, estiloDaFonte, variantesDeTexto, VarianteTexto } from '../theme';

type Props = TextProps & {
  variante?: VarianteTexto;
  cor?: string;
  centro?: boolean;
};

/** Texto padrão do app: aplica a escala tipográfica e limita a ampliação para não quebrar o layout. */
export function Texto({ variante = 'corpo', cor = cores.tinta, centro, style, ...resto }: Props) {
  const { familia, ...medidas } = variantesDeTexto[variante];
  return (
    <Text
      maxFontSizeMultiplier={1.35}
      {...resto}
      style={[{ color: cor }, medidas, estiloDaFonte(familia), centro && { textAlign: 'center' }, style]}
    />
  );
}
