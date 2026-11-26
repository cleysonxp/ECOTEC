import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores, espaco } from '../theme';
import { Botao } from './Botao';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

type Props = {
  icone: NomeIcone;
  titulo: string;
  texto: string;
  acao?: { titulo: string; onPress: () => void; icone?: NomeIcone };
  acaoSecundaria?: { titulo: string; onPress: () => void };
};

/** Tela sem conteúdo (lista vazia, erro, permissão negada): explica e oferece o próximo passo. */
export function EstadoVazio({ icone, titulo, texto, acao, acaoSecundaria }: Props) {
  return (
    <View style={estilos.area}>
      <View style={estilos.circulo}>
        <Icone nome={icone} tamanho={34} cor={cores.folha} />
      </View>
      <Texto variante="subtitulo" centro>
        {titulo}
      </Texto>
      <Texto variante="corpo" cor={cores.tintaSuave} centro style={{ maxWidth: 320 }}>
        {texto}
      </Texto>
      {acao ? (
        <Botao titulo={acao.titulo} icone={acao.icone} onPress={acao.onPress} style={{ marginTop: espaco.xs, alignSelf: 'stretch' }} />
      ) : null}
      {acaoSecundaria ? (
        <Botao titulo={acaoSecundaria.titulo} variante="suave" onPress={acaoSecundaria.onPress} style={{ alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  area: {
    alignItems: 'center',
    gap: espaco.sm,
    paddingHorizontal: espaco.xl,
    paddingVertical: espaco.xxl,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.xxs,
  },
});
