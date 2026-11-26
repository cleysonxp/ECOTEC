import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../theme';
import { ETAPAS_DO_STATUS, InfoStatus } from '../utils/status';
import { Icone } from './Icone';
import { Texto } from './Texto';

/** Etiqueta com a situação da denúncia. */
export function SeloStatus({ status }: { status: InfoStatus }) {
  return (
    <View
      style={[estilos.selo, { backgroundColor: status.fundo }]}
      accessible
      accessibilityLabel={`Situação: ${status.rotulo}`}
    >
      <Icone nome={status.icone} tamanho={14} cor={status.cor} />
      <Texto variante="legenda" cor={status.cor} style={{ fontSize: 12.5 }}>
        {status.rotulo}
      </Texto>
    </View>
  );
}

/**
 * Linha do tempo da denúncia: Recebida, Em análise, Resolvida.
 * As etapas são mesmo uma sequência, por isso aparecem como passos ligados.
 */
export function TrilhaStatus({ status }: { status: InfoStatus }) {
  if (status.etapa === null) {
    return <SeloStatus status={status} />;
  }
  const atual = status.etapa;
  return (
    <View
      style={estilos.trilha}
      accessible
      accessibilityLabel={`Situação da denúncia: ${status.rotulo}. Etapa ${atual + 1} de ${ETAPAS_DO_STATUS.length}.`}
    >
      {ETAPAS_DO_STATUS.map((etapa, indice) => {
        const feita = indice <= atual;
        const ativa = indice === atual;
        return (
          <View key={etapa} style={estilos.passo}>
            <View style={estilos.linhaDoPasso}>
              <View style={[estilos.segmento, indice === 0 && estilos.invisivel, feita && estilos.segmentoFeito]} />
              <View style={[estilos.ponto, feita && estilos.pontoFeito, ativa && estilos.pontoAtivo]}>
                {feita ? <Icone nome="check" tamanho={13} cor={cores.branco} /> : null}
              </View>
              <View
                style={[
                  estilos.segmento,
                  indice === ETAPAS_DO_STATUS.length - 1 && estilos.invisivel,
                  indice < atual && estilos.segmentoFeito,
                ]}
              />
            </View>
            <Texto
              variante={ativa ? 'apoioForte' : 'legenda'}
              cor={ativa ? cores.mata : feita ? cores.tintaSuave : cores.tintaFraca}
              centro
              style={{ fontSize: 13 }}
            >
              {etapa}
            </Texto>
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaco.xs,
    paddingVertical: 4,
    borderRadius: raio.pilula,
    alignSelf: 'flex-start',
  },
  trilha: {
    flexDirection: 'row',
  },
  passo: {
    flex: 1,
    gap: 6,
  },
  linhaDoPasso: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  segmento: {
    flex: 1,
    height: 3,
    backgroundColor: cores.linha,
  },
  segmentoFeito: {
    backgroundColor: cores.folha,
  },
  invisivel: {
    opacity: 0,
  },
  ponto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.linha,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pontoFeito: {
    backgroundColor: cores.folha,
    borderColor: cores.folha,
  },
  pontoAtivo: {
    borderColor: cores.menta,
    borderWidth: 3,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
