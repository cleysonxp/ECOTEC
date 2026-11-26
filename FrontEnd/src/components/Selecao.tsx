import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ALVO_DE_TOQUE, cores, espaco, raio } from '../theme';
import { Icone } from './Icone';
import { Texto } from './Texto';

/** Caixa de seleção com texto livre ao lado (aceite de termos, por exemplo). */
export function CaixaDeSelecao({
  marcada,
  aoAlternar,
  rotulo,
  children,
  erro,
}: {
  marcada: boolean;
  aoAlternar: () => void;
  rotulo: string;
  children: React.ReactNode;
  erro?: string | null;
}) {
  return (
    <View style={{ marginBottom: espaco.md }}>
      <View style={estilos.linha}>
        <Pressable
          onPress={aoAlternar}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: marcada }}
          accessibilityLabel={rotulo}
          style={estilos.alvo}
        >
          <View style={[estilos.caixa, marcada && estilos.caixaMarcada, !!erro && !marcada && { borderColor: cores.erro }]}>
            {marcada ? <Icone nome="check" tamanho={18} cor={cores.branco} /> : null}
          </View>
        </Pressable>
        <View style={{ flex: 1, paddingTop: 2 }}>{children}</View>
      </View>
      {erro ? (
        <View style={estilos.erro} accessibilityLiveRegion="polite">
          <Icone nome="alert-circle-outline" tamanho={16} cor={cores.erro} />
          <Texto variante="apoio" cor={cores.erro} style={{ flex: 1 }}>
            {erro}
          </Texto>
        </View>
      ) : null}
    </View>
  );
}

/** Opção em formato de pílula para filtros (raio do feed, situação da denúncia). */
export function Pilula({
  rotulo,
  selecionada,
  onPress,
  sobreVerde = false,
  dica,
}: {
  rotulo: string;
  selecionada: boolean;
  onPress: () => void;
  /** Usa as cores para fundo verde-mata. */
  sobreVerde?: boolean;
  dica?: string;
}) {
  const fundo = selecionada ? (sobreVerde ? cores.branco : cores.folha) : sobreVerde ? 'transparent' : cores.branco;
  const borda = selecionada ? (sobreVerde ? cores.branco : cores.folha) : sobreVerde ? 'rgba(255,255,255,0.45)' : cores.linha;
  const cor = selecionada ? (sobreVerde ? cores.mata : cores.branco) : sobreVerde ? cores.branco : cores.tintaSuave;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionada }}
      accessibilityLabel={dica ?? rotulo}
      style={({ pressed }) => [estilos.pilula, { backgroundColor: fundo, borderColor: borda, opacity: pressed ? 0.75 : 1 }]}
    >
      <Texto variante="apoioForte" cor={cor}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.xs,
  },
  alvo: {
    minWidth: 32,
    minHeight: ALVO_DE_TOQUE - 16,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  caixa: {
    width: 26,
    height: 26,
    borderRadius: raio.sm,
    borderWidth: 2,
    borderColor: cores.tintaFraca,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caixaMarcada: {
    backgroundColor: cores.folha,
    borderColor: cores.folha,
  },
  erro: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  pilula: {
    minHeight: 38,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
