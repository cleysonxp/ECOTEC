import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { cores, raio } from '../theme';
import { Denuncia, tituloDeExibicao } from '../utils/denuncia';
import { Coordenadas } from '../utils/formatadores';
import { CurvasDeNivel } from './CurvasDeNivel';
import { Icone } from './Icone';
import { Texto } from './Texto';

/**
 * Versão do mapa para a pré-visualização no navegador.
 * O mapa de verdade (react-native-maps) só existe no celular; aqui os marcadores
 * são posicionados sobre um fundo ilustrativo, respeitando distância e direção.
 */

export function corDoMarcador(etapa: 0 | 1 | 2 | null): string {
  if (etapa === 2) return cores.folha;
  if (etapa === 1) return '#E08A00';
  return cores.info;
}

type PropsDenuncias = {
  centro: Coordenadas;
  raioKm: number;
  denuncias: Denuncia[];
  aoSelecionar: (denuncia: Denuncia | null) => void;
  style?: StyleProp<ViewStyle>;
};

export function MapaDenuncias({ centro, raioKm, denuncias, aoSelecionar, style }: PropsDenuncias) {
  const alcance = raioKm * 1.25; // km do centro até a borda do quadro
  return (
    <Pressable style={[estilos.fundo, style]} onPress={() => aoSelecionar(null)} accessibilityLabel="Mapa das denúncias">
      <CurvasDeNivel cor="#CFE6D8" />
      <View style={estilos.circulo} pointerEvents="none" />
      <View style={[estilos.voce, { left: '50%', top: '50%' }]} pointerEvents="none" />
      {denuncias.map((d) => {
        if (d.endereco.latitude === undefined || d.endereco.longitude === undefined) return null;
        const norte = (d.endereco.latitude - centro.latitude) * 111;
        const leste = (d.endereco.longitude - centro.longitude) * 111 * Math.cos((centro.latitude * Math.PI) / 180);
        const x = 50 + (leste / alcance) * 50;
        const y = 50 - (norte / alcance) * 50;
        return (
          <Pressable
            key={d.id}
            onPress={() => aoSelecionar(d)}
            accessibilityRole="button"
            accessibilityLabel={`${tituloDeExibicao(d)}, ${d.status.rotulo}`}
            style={[estilos.marcador, { left: `${x}%`, top: `${y}%` }]}
          >
            <Icone nome="map-marker" tamanho={38} cor={corDoMarcador(d.status.etapa)} />
          </Pressable>
        );
      })}
      <View style={estilos.nota} pointerEvents="none">
        <Texto variante="legenda" cor={cores.tintaSuave}>
          Pré-visualização. No celular, o mapa é o do sistema.
        </Texto>
      </View>
    </Pressable>
  );
}

type PropsLocal = {
  ponto: Coordenadas;
  ajustavel?: boolean;
  aoMover?: (ponto: Coordenadas) => void;
  style?: StyleProp<ViewStyle>;
};

export function MapaDoLocal({ style }: PropsLocal) {
  return (
    <View style={[estilos.fundo, style]} accessibilityLabel="Mapa do local da ocorrência">
      <CurvasDeNivel cor="#CFE6D8" />
      <View style={[estilos.marcador, { left: '50%', top: '50%' }]}>
        <Icone nome="map-marker" tamanho={44} cor={cores.folha} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    backgroundColor: '#E4F1E9',
    overflow: 'hidden',
  },
  circulo: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '50%',
    aspectRatio: 1,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(15, 107, 69, 0.55)',
    backgroundColor: 'rgba(47, 191, 116, 0.10)',
    transform: [{ translateY: '-50%' }],
  },
  voce: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: '#2F7DE1',
    borderWidth: 3,
    borderColor: cores.branco,
  },
  marcador: {
    position: 'absolute',
    marginLeft: -19,
    marginTop: -36,
  },
  nota: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: raio.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
