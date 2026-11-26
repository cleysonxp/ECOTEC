import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { cores, espaco, raio } from '../theme';

/** Bloco cinza-esverdeado que pulsa enquanto o conteúdo carrega. */
export function Esqueleto({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacidade = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    animacao.start();
    return () => animacao.stop();
  }, [opacidade]);
  return <Animated.View style={[{ backgroundColor: cores.orvalho, borderRadius: raio.sm, opacity: opacidade }, style]} />;
}

/** Espaço reservado com o formato de um cartão de denúncia. */
export function EsqueletoDeCartao() {
  return (
    <View style={estilos.cartao} accessibilityLabel="Carregando denúncias" accessible>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.xs }}>
        <Esqueleto style={{ width: 36, height: 36, borderRadius: 18 }} />
        <Esqueleto style={{ width: 150, height: 14 }} />
      </View>
      <Esqueleto style={{ width: '80%', height: 18 }} />
      <Esqueleto style={{ width: '100%', height: 12 }} />
      <Esqueleto style={{ width: '100%', height: 150, borderRadius: raio.md }} />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.md,
    gap: espaco.sm,
  },
});
