import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { cores } from '../theme';

export type NomeIcone = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = { nome: NomeIcone; tamanho?: number; cor?: string };

/** Ícone decorativo (o rótulo de acessibilidade fica no elemento que o contém). */
export function Icone({ nome, tamanho = 22, cor = cores.tinta }: Props) {
  return (
    <MaterialCommunityIcons
      name={nome}
      size={tamanho}
      color={cor}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
