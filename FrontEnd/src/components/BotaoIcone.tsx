import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { ALVO_DE_TOQUE, cores } from '../theme';
import { Icone, NomeIcone } from './Icone';

type Props = {
  icone: NomeIcone;
  /** Descrição lida pelos leitores de tela (obrigatória: o botão não tem texto visível). */
  rotulo: string;
  onPress: () => void;
  cor?: string;
  fundo?: string;
  tamanho?: number;
  style?: StyleProp<ViewStyle>;
  desabilitado?: boolean;
};

export function BotaoIcone({ icone, rotulo, onPress, cor = cores.tinta, fundo, tamanho = 24, style, desabilitado }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: !!desabilitado }}
      style={({ pressed }) => [
        {
          width: ALVO_DE_TOQUE - 4,
          height: ALVO_DE_TOQUE - 4,
          borderRadius: (ALVO_DE_TOQUE - 4) / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fundo,
          opacity: pressed ? 0.6 : desabilitado ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icone nome={icone} tamanho={tamanho} cor={cor} />
    </Pressable>
  );
}
