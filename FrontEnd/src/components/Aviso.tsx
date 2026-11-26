import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { cores, espaco, raio } from '../theme';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

type Tipo = 'info' | 'erro' | 'alerta' | 'sucesso';

const TEMAS: Record<Tipo, { cor: string; fundo: string; icone: NomeIcone }> = {
  info: { cor: cores.info, fundo: cores.infoFundo, icone: 'information-outline' },
  erro: { cor: cores.erro, fundo: cores.erroFundo, icone: 'alert-circle-outline' },
  alerta: { cor: cores.alerta, fundo: cores.alertaFundo, icone: 'alert-outline' },
  sucesso: { cor: cores.folha, fundo: cores.orvalho, icone: 'check-circle-outline' },
};

type Props = {
  tipo?: Tipo;
  titulo?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  acao?: React.ReactNode;
};

/** Mensagem dentro da tela: diz o que aconteceu e o que fazer. */
export function Aviso({ tipo = 'info', titulo, children, style, acao }: Props) {
  const tema = TEMAS[tipo];
  return (
    <View
      style={[estilos.caixa, { backgroundColor: tema.fundo }, style]}
      accessibilityRole={tipo === 'erro' ? 'alert' : undefined}
      accessibilityLiveRegion={tipo === 'erro' ? 'polite' : undefined}
    >
      <Icone nome={tema.icone} tamanho={20} cor={tema.cor} />
      <View style={{ flex: 1, gap: 2 }}>
        {titulo ? (
          <Texto variante="apoioForte" cor={tema.cor}>
            {titulo}
          </Texto>
        ) : null}
        <Texto variante="apoio" cor={cores.tinta}>
          {children}
        </Texto>
        {acao ? <View style={{ marginTop: espaco.xs, alignItems: 'flex-start' }}>{acao}</View> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.xs,
    borderRadius: raio.md,
    padding: espaco.sm,
  },
});
