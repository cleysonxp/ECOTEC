import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../../theme';
import { Coordenadas, mascararCep } from '../../utils/formatadores';
import { LIMITES } from '../../utils/validacao';
import { Aviso } from '../Aviso';
import { Botao } from '../Botao';
import { Campo } from '../Campo';
import { Icone } from '../Icone';
import { MapaDoLocal } from '../Mapa';
import { Texto } from '../Texto';

export type LocalDaDenuncia = {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  pontoReferencia: string;
};

export const LOCAL_VAZIO: LocalDaDenuncia = {
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  pontoReferencia: '',
};

export type SituacaoDoGps = 'buscando' | 'ok' | 'negada' | 'erro';

type Props = {
  ponto: Coordenadas | null;
  gps: SituacaoDoGps;
  buscandoEndereco: boolean;
  local: LocalDaDenuncia;
  aoMudarLocal: (campo: keyof LocalDaDenuncia, valor: string) => void;
  aoMoverPonto: (ponto: Coordenadas) => void;
  aoUsarMinhaLocalizacao: () => void;
  erroDoPonto?: string | null;
  erroDoEstado?: string | null;
  desabilitada?: boolean;
};

/**
 * Local da ocorrência (RF09): o GPS marca o ponto automaticamente, o usuário pode ajustá-lo
 * no mapa, e o endereço é preenchido a partir das coordenadas (e pode ser corrigido).
 */
export function SecaoLocal({
  ponto,
  gps,
  buscandoEndereco,
  local,
  aoMudarLocal,
  aoMoverPonto,
  aoUsarMinhaLocalizacao,
  erroDoPonto,
  erroDoEstado,
  desabilitada,
}: Props) {
  return (
    <View>
      <View style={estilos.situacao} accessibilityLiveRegion="polite">
        {gps === 'buscando' ? (
          <>
            <ActivityIndicator color={cores.folha} />
            <Texto variante="apoioForte" cor={cores.tintaSuave} style={{ flex: 1 }}>
              Buscando sua localização pelo GPS…
            </Texto>
          </>
        ) : ponto ? (
          <>
            <Icone nome="map-marker-check-outline" tamanho={22} cor={cores.folha} />
            <Texto variante="apoioForte" cor={cores.folha} style={{ flex: 1 }}>
              Local marcado: {ponto.latitude.toFixed(5)}, {ponto.longitude.toFixed(5)}
            </Texto>
          </>
        ) : null}
      </View>

      {gps === 'negada' ? (
        <Aviso tipo="alerta" titulo="Localização não permitida" style={{ marginBottom: espaco.sm }}>
          A denúncia precisa do local da ocorrência. Permita o acesso à localização nos ajustes do aparelho e toque em
          "Usar minha localização atual".
        </Aviso>
      ) : null}
      {gps === 'erro' && !ponto ? (
        <Aviso tipo="alerta" titulo="Não foi possível obter o local" style={{ marginBottom: espaco.sm }}>
          Confira se a localização do aparelho está ligada e tente de novo.
        </Aviso>
      ) : null}
      {erroDoPonto ? (
        <Aviso tipo="erro" style={{ marginBottom: espaco.sm }}>
          {erroDoPonto}
        </Aviso>
      ) : null}

      {ponto ? (
        <View>
          <View style={estilos.mapa}>
            <MapaDoLocal ponto={ponto} ajustavel={!desabilitada} aoMover={aoMoverPonto} style={{ flex: 1 }} />
          </View>
          <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginTop: 6 }}>
            Não é exatamente aqui? Toque no mapa ou arraste o marcador para ajustar.
          </Texto>
        </View>
      ) : null}

      <Botao
        titulo="Usar minha localização atual"
        icone="crosshairs-gps"
        variante="suave"
        compacto
        onPress={aoUsarMinhaLocalizacao}
        carregando={gps === 'buscando'}
        desabilitado={desabilitada}
        style={{ marginTop: espaco.sm, marginBottom: espaco.lg }}
      />

      <View style={estilos.tituloEndereco}>
        <Texto variante="corpoForte">Endereço do local</Texto>
        {buscandoEndereco ? <ActivityIndicator color={cores.folha} size="small" /> : null}
      </View>
      <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginBottom: espaco.sm }}>
        Preenchido a partir do ponto no mapa. Corrija o que estiver diferente.
      </Texto>

      <View style={estilos.linha}>
        <View style={{ flex: 1 }}>
          <Campo
            rotulo="Rua"
            placeholder="Rua, avenida, estrada"
            value={local.rua}
            onChangeText={(t) => aoMudarLocal('rua', t)}
            autoCapitalize="words"
            maxLength={LIMITES.endereco}
            editable={!desabilitada}
            testID="local-rua"
          />
        </View>
        <View style={{ width: 104 }}>
          <Campo
            rotulo="Número"
            placeholder="s/n"
            value={local.numero}
            onChangeText={(t) => aoMudarLocal('numero', t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            editable={!desabilitada}
            testID="local-numero"
          />
        </View>
      </View>
      <Campo
        rotulo="Bairro"
        placeholder="Bairro"
        value={local.bairro}
        onChangeText={(t) => aoMudarLocal('bairro', t)}
        autoCapitalize="words"
        maxLength={LIMITES.endereco}
        editable={!desabilitada}
        testID="local-bairro"
      />
      <View style={estilos.linha}>
        <View style={{ flex: 1 }}>
          <Campo
            rotulo="Cidade"
            placeholder="Cidade"
            value={local.cidade}
            onChangeText={(t) => aoMudarLocal('cidade', t)}
            autoCapitalize="words"
            maxLength={LIMITES.endereco}
            editable={!desabilitada}
            testID="local-cidade"
          />
        </View>
        <View style={{ width: 104 }}>
          <Campo
            rotulo="Estado"
            placeholder="SP"
            value={local.estado}
            onChangeText={(t) => aoMudarLocal('estado', t.replace(/[^A-Za-z]/g, '').toUpperCase())}
            erro={erroDoEstado}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={2}
            editable={!desabilitada}
            testID="local-estado"
          />
        </View>
      </View>
      <Campo
        rotulo="CEP"
        placeholder="00000-000"
        value={local.cep}
        onChangeText={(t) => aoMudarLocal('cep', mascararCep(t))}
        keyboardType="number-pad"
        maxLength={9}
        editable={!desabilitada}
        opcional
        testID="local-cep"
      />
      <Campo
        rotulo="Ponto de referência"
        placeholder="Ex.: atrás do campo de futebol"
        value={local.pontoReferencia}
        onChangeText={(t) => aoMudarLocal('pontoReferencia', t)}
        maxLength={LIMITES.pontoReferencia}
        editable={!desabilitada}
        opcional
        testID="local-referencia"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  situacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    minHeight: 28,
    marginBottom: espaco.sm,
  },
  mapa: {
    height: 200,
    borderRadius: raio.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.linha,
    backgroundColor: cores.orvalho,
  },
  tituloEndereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  linha: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
});
