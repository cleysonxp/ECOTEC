import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { cores } from '../theme';
import { CURVAS_DE_NIVEL, CURVAS_VIEWBOX } from '../theme/curvasDeNivel';

/**
 * Curvas de nível (como nas cartas topográficas) usadas como fundo dos cabeçalhos verdes.
 * Reforçam a ideia de território e geolocalização sem competir com o conteúdo.
 */
export const CurvasDeNivel = React.memo(function CurvasDeNivel({ cor = cores.mataClara }: { cor?: string }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={CURVAS_VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {CURVAS_DE_NIVEL.map((d, i) => (
        <Path key={i} d={d} stroke={cor} strokeWidth={1.1} fill="none" />
      ))}
    </Svg>
  );
});
