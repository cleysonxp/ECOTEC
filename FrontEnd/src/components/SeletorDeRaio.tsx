import React from 'react';
import { ScrollView, View } from 'react-native';
import { RAIOS_KM, useLocalizacao } from '../contexts/LocalizacaoContext';
import { cores, espaco } from '../theme';
import { Pilula } from './Selecao';
import { Texto } from './Texto';

/** Escolha do raio de busca das denúncias (RF03), para uso sobre o cabeçalho verde. */
export function SeletorDeRaio() {
  const { raioKm, definirRaio } = useLocalizacao();
  return (
    <View style={{ marginTop: espaco.sm, marginHorizontal: -espaco.lg }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: espaco.lg, gap: espaco.xs, alignItems: 'center' }}
        accessibilityRole="radiogroup"
        accessibilityLabel="Raio de busca"
      >
        <Texto variante="apoioForte" cor={cores.menta} style={{ marginRight: 2 }}>
          Raio
        </Texto>
        {RAIOS_KM.map((km) => (
          <Pilula
            key={km}
            rotulo={`${km} km`}
            dica={`Raio de ${km} quilômetros`}
            selecionada={raioKm === km}
            onPress={() => definirRaio(km)}
            sobreVerde
          />
        ))}
      </ScrollView>
    </View>
  );
}
