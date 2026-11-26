import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { cores } from '../theme';
import { Denuncia, tituloDeExibicao } from '../utils/denuncia';
import { Coordenadas } from '../utils/formatadores';

/** Cor do marcador conforme a situação da denúncia. */
export function corDoMarcador(etapa: 0 | 1 | 2 | null): string {
  if (etapa === 2) return cores.folha;
  if (etapa === 1) return '#E08A00';
  return cores.info;
}

function regiaoDoRaio(centro: Coordenadas, raioKm: number): Region {
  const latitudeDelta = (raioKm * 2.5) / 111;
  const longitudeDelta = latitudeDelta / Math.max(0.2, Math.cos((centro.latitude * Math.PI) / 180));
  return { ...centro, latitudeDelta, longitudeDelta };
}

type PropsDenuncias = {
  centro: Coordenadas;
  raioKm: number;
  denuncias: Denuncia[];
  aoSelecionar: (denuncia: Denuncia | null) => void;
  style?: StyleProp<ViewStyle>;
};

/** Mapa com as denúncias dentro do raio escolhido (Apple Maps no iOS, Google Maps no Android). */
export function MapaDenuncias({ centro, raioKm, denuncias, aoSelecionar, style }: PropsDenuncias) {
  const mapa = useRef<MapView>(null);
  const regiao = useMemo(() => regiaoDoRaio(centro, raioKm), [centro.latitude, centro.longitude, raioKm]);

  useEffect(() => {
    mapa.current?.animateToRegion(regiao, 350);
  }, [regiao]);

  return (
    <MapView
      ref={mapa}
      style={style}
      initialRegion={regiao}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      onPress={(evento) => {
        // No iOS, o toque em um marcador também chega aqui: não deve limpar a seleção.
        if (evento.nativeEvent.action === 'marker-press') return;
        aoSelecionar(null);
      }}
    >
      <Circle
        center={centro}
        radius={raioKm * 1000}
        strokeWidth={2}
        strokeColor="rgba(15, 107, 69, 0.7)"
        fillColor="rgba(47, 191, 116, 0.10)"
      />
      {denuncias.map((d) =>
        d.endereco.latitude !== undefined && d.endereco.longitude !== undefined ? (
          <Marker
            key={d.id}
            coordinate={{ latitude: d.endereco.latitude, longitude: d.endereco.longitude }}
            pinColor={corDoMarcador(d.status.etapa)}
            title={Platform.OS === 'android' ? tituloDeExibicao(d) : undefined}
            onPress={(evento) => {
              evento.stopPropagation();
              aoSelecionar(d);
            }}
            accessibilityLabel={`${tituloDeExibicao(d)}, ${d.status.rotulo}`}
          />
        ) : null,
      )}
    </MapView>
  );
}

type PropsLocal = {
  ponto: Coordenadas;
  /** Permite ajustar o ponto tocando no mapa ou arrastando o marcador. */
  ajustavel?: boolean;
  aoMover?: (ponto: Coordenadas) => void;
  style?: StyleProp<ViewStyle>;
};

/** Mapa pequeno com um único marcador: o local da ocorrência. */
export function MapaDoLocal({ ponto, ajustavel = false, aoMover, style }: PropsLocal) {
  const mapa = useRef<MapView>(null);
  const regiao: Region = { ...ponto, latitudeDelta: 0.006, longitudeDelta: 0.006 };

  useEffect(() => {
    mapa.current?.animateToRegion({ ...ponto, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 300);
  }, [ponto.latitude, ponto.longitude]);

  return (
    <MapView
      ref={mapa}
      style={style}
      initialRegion={regiao}
      scrollEnabled={ajustavel}
      zoomEnabled={ajustavel}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      liteMode={!ajustavel}
      onPress={ajustavel ? (evento) => aoMover?.(evento.nativeEvent.coordinate) : undefined}
    >
      <Marker
        coordinate={ponto}
        pinColor={cores.folha}
        draggable={ajustavel}
        onDragEnd={(evento) => aoMover?.(evento.nativeEvent.coordinate)}
        accessibilityLabel="Local da ocorrência"
      />
    </MapView>
  );
}
