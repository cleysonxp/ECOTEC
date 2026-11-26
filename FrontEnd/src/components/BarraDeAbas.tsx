import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, espaco } from '../theme';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

const ABAS: Record<string, { rotulo: string; icone: NomeIcone; iconeAtivo: NomeIcone }> = {
  Inicio: { rotulo: 'Início', icone: 'home-variant-outline', iconeAtivo: 'home-variant' },
  Mapa: { rotulo: 'Mapa', icone: 'map-outline', iconeAtivo: 'map' },
  Historico: { rotulo: 'Minhas', icone: 'clipboard-text-clock-outline', iconeAtivo: 'clipboard-text-clock' },
  Perfil: { rotulo: 'Perfil', icone: 'account-outline', iconeAtivo: 'account' },
};

/**
 * Barra inferior com quatro abas e, no centro, o botão de registrar denúncia
 * - a ação principal do app fica sempre a um toque.
 */
export function BarraDeAbas({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const aba = (indice: number) => {
    const rota = state.routes[indice];
    const config = ABAS[rota.name];
    const ativa = state.index === indice;
    return (
      <Pressable
        key={rota.key}
        onPress={() => {
          const evento = navigation.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
          if (!ativa && !evento.defaultPrevented) navigation.navigate(rota.name);
        }}
        accessibilityRole="tab"
        accessibilityState={{ selected: ativa }}
        accessibilityLabel={config.rotulo === 'Minhas' ? 'Minhas denúncias' : config.rotulo}
        style={estilos.aba}
      >
        <Icone nome={ativa ? config.iconeAtivo : config.icone} tamanho={25} cor={ativa ? cores.folha : cores.tintaSuave} />
        <Texto variante="legenda" cor={ativa ? cores.folha : cores.tintaSuave} maxFontSizeMultiplier={1.15} numberOfLines={1}>
          {config.rotulo}
        </Texto>
        <View style={[estilos.indicador, ativa && { backgroundColor: cores.folha }]} />
      </Pressable>
    );
  };

  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, espaco.xs) }]} accessibilityRole="tablist">
      {aba(0)}
      {aba(1)}
      <View style={estilos.centro}>
        <Pressable
          onPress={() => navigation.navigate('NovaDenuncia')}
          accessibilityRole="button"
          accessibilityLabel="Registrar nova denúncia"
          style={({ pressed }) => [estilos.denunciar, pressed && { backgroundColor: cores.folhaPressionada }]}
        >
          <Icone nome="plus" tamanho={32} cor={cores.branco} />
        </Pressable>
        <Texto variante="legenda" cor={cores.mata} maxFontSizeMultiplier={1.15}>
          Denunciar
        </Texto>
      </View>
      {aba(2)}
      {aba(3)}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    paddingTop: 6,
    paddingHorizontal: espaco.xxs,
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    minHeight: 52,
  },
  indicador: {
    width: 18,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  centro: {
    flex: 1.15,
    alignItems: 'center',
    gap: 2,
    paddingBottom: 5,
  },
  denunciar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -30,
    backgroundColor: cores.folha,
    borderWidth: 4,
    borderColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
});
