import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConexao } from '../hooks/useConexao';
import { cores, espaco, raio } from '../theme';
import { Icone } from './Icone';
import { Texto } from './Texto';

/** Aviso fixo no topo quando o aparelho fica sem internet (RNF10). */
export function FaixaSemConexao() {
  const { conectado } = useConexao();
  const insets = useSafeAreaInsets();
  if (conectado) return null;
  return (
    <View pointerEvents="none" style={[estilos.area, { top: insets.top + 6 }]}>
      <View style={estilos.faixa} accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <Icone nome="wifi-off" tamanho={18} cor={cores.alerta} />
        <Texto variante="apoioForte" cor={cores.alerta}>
          Sem conexão com a internet
        </Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  area: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    backgroundColor: cores.alertaFundo,
    borderRadius: raio.pilula,
    paddingVertical: 8,
    paddingHorizontal: espaco.md,
    borderWidth: 1,
    borderColor: '#E9C46A',
  },
});
