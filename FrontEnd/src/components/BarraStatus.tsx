import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

/** Cor dos ícones da barra de status, aplicada só pela tela que está em foco. */
export function BarraStatus({ estilo }: { estilo: 'light' | 'dark' }) {
  const emFoco = useIsFocused();
  return emFoco ? <StatusBar style={estilo} /> : null;
}
