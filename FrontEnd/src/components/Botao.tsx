import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ALVO_DE_TOQUE, cores, espaco, raio } from '../theme';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

type Variante = 'primario' | 'secundario' | 'suave' | 'perigo' | 'claro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: NomeIcone;
  carregando?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  style?: StyleProp<ViewStyle>;
  dicaAcessibilidade?: string;
  testID?: string;
};

const TEMAS: Record<Variante, { fundo: string; fundoPressionado: string; texto: string; borda?: string }> = {
  primario: { fundo: cores.folha, fundoPressionado: cores.folhaPressionada, texto: cores.branco },
  secundario: { fundo: cores.branco, fundoPressionado: cores.orvalho, texto: cores.folha, borda: cores.folha },
  suave: { fundo: cores.orvalho, fundoPressionado: cores.menta, texto: cores.folha },
  perigo: { fundo: cores.branco, fundoPressionado: cores.erroFundo, texto: cores.erro, borda: cores.erro },
  claro: { fundo: cores.branco, fundoPressionado: cores.menta, texto: cores.mata },
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  compacto = false,
  style,
  dicaAcessibilidade,
  testID,
}: Props) {
  const tema = TEMAS[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dicaAcessibilidade}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        compacto && estilos.compacto,
        { backgroundColor: pressed ? tema.fundoPressionado : tema.fundo },
        tema.borda ? { borderWidth: 1.5, borderColor: tema.borda } : null,
        desabilitado && !carregando ? estilos.desabilitado : null,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={tema.texto} />
      ) : (
        <View style={estilos.conteudo}>
          {icone ? <Icone nome={icone} tamanho={compacto ? 18 : 20} cor={tema.texto} /> : null}
          <Texto variante={compacto ? 'apoioForte' : 'botao'} cor={tema.texto} numberOfLines={1}>
            {titulo}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: raio.lg,
    paddingHorizontal: espaco.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compacto: {
    minHeight: ALVO_DE_TOQUE - 4,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  desabilitado: {
    opacity: 0.45,
  },
});
