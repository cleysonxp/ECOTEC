import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { cores } from '../theme';
import { Texto } from './Texto';

type Tema = 'claro' | 'escuro';

const PIN = 'M256 484 C 200 410 104 322 104 214 A152 152 0 0 1 408 214 C 408 322 312 410 256 484 Z';
const VEIAS = ['M256 440 V150', 'M256 362 L196 302 V272', 'M256 306 L318 244 V214', 'M256 246 L210 200'];
const NOS: Array<[number, number, 'e' | 'd']> = [
  [256, 136, 'd'],
  [196, 258, 'e'],
  [318, 200, 'd'],
  [200, 190, 'e'],
];

/**
 * Símbolo do EcoTec: um marcador de mapa que também é uma folha.
 * As nervuras terminam em pontos de circuito, unindo localização, meio ambiente e tecnologia.
 * `tema="claro"` para fundos brancos e `tema="escuro"` para o verde-mata.
 */
export function Simbolo({ tamanho = 56, tema = 'claro' }: { tamanho?: number; tema?: Tema }) {
  const id = `pin${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const esquerda = tema === 'claro' ? cores.broto : cores.branco;
  const direita = tema === 'claro' ? cores.folha : cores.menta;
  const veia = tema === 'claro' ? cores.branco : cores.mata;

  return (
    <Svg
      width={tamanho * 0.72}
      height={tamanho}
      viewBox="88 46 336 454"
      accessibilityRole="image"
      accessibilityLabel="Símbolo do EcoTec"
    >
      <Defs>
        <ClipPath id={id}>
          <Path d={PIN} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        <Rect x={0} y={0} width={256} height={512} fill={esquerda} />
        <Rect x={256} y={0} width={256} height={512} fill={direita} />
      </G>
      <G fill="none" stroke={veia} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round">
        {VEIAS.map((d) => (
          <Path key={d} d={d} />
        ))}
      </G>
      {NOS.map(([x, y, lado]) => (
        <G key={`${x}-${y}`}>
          <Circle cx={x} cy={y} r={20} fill={veia} />
          <Circle cx={x} cy={y} r={8.5} fill={lado === 'e' ? esquerda : direita} />
        </G>
      ))}
    </Svg>
  );
}

/** Símbolo + nome do app. */
export function Marca({ tamanho = 44, tema = 'claro' }: { tamanho?: number; tema?: Tema }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tamanho * 0.22 }} accessible accessibilityLabel="EcoTec">
      <Simbolo tamanho={tamanho} tema={tema} />
      <Texto
        variante="destaque"
        cor={tema === 'claro' ? cores.mata : cores.branco}
        style={{ fontSize: tamanho * 0.62, lineHeight: tamanho * 0.8, letterSpacing: -0.8 }}
        maxFontSizeMultiplier={1}
      >
        EcoTec
      </Texto>
    </View>
  );
}
