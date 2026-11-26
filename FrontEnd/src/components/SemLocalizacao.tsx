import React from 'react';
import { Linking } from 'react-native';
import { SituacaoLocalizacao, useLocalizacao } from '../contexts/LocalizacaoContext';
import { EstadoVazio } from './EstadoVazio';

/** Explica por que a tela não pode mostrar denúncias sem a localização e oferece o próximo passo. */
export function SemLocalizacao({ situacao }: { situacao: Exclude<SituacaoLocalizacao, 'ok' | 'carregando'> }) {
  const { atualizar, podePedirDeNovo } = useLocalizacao();

  if (situacao === 'negada') {
    return (
      <EstadoVazio
        icone="map-marker-alert-outline"
        titulo="Permita o acesso à localização"
        texto="O EcoTec mostra as denúncias perto de você. Sem a localização, não dá para saber qual é a sua região."
        acao={
          podePedirDeNovo
            ? { titulo: 'Permitir localização', icone: 'crosshairs-gps', onPress: () => void atualizar() }
            : { titulo: 'Abrir os ajustes', icone: 'cog-outline', onPress: () => void Linking.openSettings() }
        }
        acaoSecundaria={podePedirDeNovo ? undefined : { titulo: 'Já permiti, tentar de novo', onPress: () => void atualizar() }}
      />
    );
  }

  if (situacao === 'desligada') {
    return (
      <EstadoVazio
        icone="crosshairs-gps"
        titulo="A localização do aparelho está desligada"
        texto="Ligue a localização (GPS) nos ajustes do celular para ver as denúncias da sua região."
        acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void atualizar() }}
      />
    );
  }

  return (
    <EstadoVazio
      icone="crosshairs-gps"
      titulo="Não foi possível obter sua localização"
      texto="Vá para um lugar com melhor sinal, como perto de uma janela, e tente de novo."
      acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void atualizar() }}
    />
  );
}
