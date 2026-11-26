import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { mensagemDeErro } from '../../api/cliente';
import { BarraStatus } from '../../components/BarraStatus';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { EstadoVazio } from '../../components/EstadoVazio';
import { Icone } from '../../components/Icone';
import { corDoMarcador, MapaDenuncias } from '../../components/Mapa';
import { SeletorDeRaio } from '../../components/SeletorDeRaio';
import { SemLocalizacao } from '../../components/SemLocalizacao';
import { SeloStatus } from '../../components/Status';
import { Texto } from '../../components/Texto';
import { useLocalizacao } from '../../contexts/LocalizacaoContext';
import { useDenunciasProximas } from '../../hooks/useDenuncias';
import { cores, espaco, raio } from '../../theme';
import { Denuncia, tituloDeExibicao } from '../../utils/denuncia';
import { contar, distanciaKm, formatarDistancia, formatarRegiao } from '../../utils/formatadores';
import { ETAPAS_DO_STATUS } from '../../utils/status';

/** Mapa: as mesmas denúncias do feed, posicionadas no território (RF03 e RF09). */
export function MapaScreen() {
  const navigation = useNavigation();
  const { situacao, coordenadas, raioKm } = useLocalizacao();
  const consulta = useDenunciasProximas(coordenadas, raioKm);
  const [selecionada, setSelecionada] = useState<Denuncia | null>(null);
  const denuncias = consulta.data ?? [];

  // Se a denúncia selecionada sair da lista (mudança de raio), fecha o cartão.
  useEffect(() => {
    if (selecionada && !denuncias.some((d) => d.id === selecionada.id)) setSelecionada(null);
  }, [denuncias, selecionada]);

  let corpo: React.ReactNode;
  if (!coordenadas && situacao === 'carregando') {
    corpo = (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.folha} size="large" />
        <Texto variante="apoio" cor={cores.tintaSuave}>
          Buscando sua localização…
        </Texto>
      </View>
    );
  } else if (!coordenadas) {
    corpo = (
      <View style={estilos.centro}>
        <SemLocalizacao situacao={situacao as 'negada' | 'desligada' | 'erro'} />
      </View>
    );
  } else if (consulta.isError) {
    corpo = (
      <View style={estilos.centro}>
        <EstadoVazio
          icone="cloud-off-outline"
          titulo="Não foi possível carregar o mapa"
          texto={mensagemDeErro(consulta.error)}
          acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void consulta.refetch() }}
        />
      </View>
    );
  } else {
    const distancia =
      selecionada && selecionada.endereco.latitude !== undefined && selecionada.endereco.longitude !== undefined
        ? formatarDistancia(
            distanciaKm(coordenadas, {
              latitude: selecionada.endereco.latitude,
              longitude: selecionada.endereco.longitude,
            }),
          )
        : null;

    corpo = (
      <View style={{ flex: 1 }}>
        <MapaDenuncias
          centro={coordenadas}
          raioKm={raioKm}
          denuncias={denuncias}
          aoSelecionar={setSelecionada}
          style={StyleSheet.absoluteFill}
        />

        <View style={estilos.legenda} accessible accessibilityLabel="Legenda: cor do marcador conforme a situação da denúncia">
          {ETAPAS_DO_STATUS.map((etapa, indice) => (
            <View key={etapa} style={estilos.itemLegenda}>
              <View style={[estilos.bolinha, { backgroundColor: corDoMarcador(indice as 0 | 1 | 2) }]} />
              <Texto variante="legenda" cor={cores.tinta}>
                {etapa}
              </Texto>
            </View>
          ))}
        </View>

        {consulta.isPending ? (
          <View style={estilos.carregando}>
            <ActivityIndicator color={cores.folha} />
            <Texto variante="apoioForte">Carregando denúncias…</Texto>
          </View>
        ) : null}

        {selecionada ? (
          <Pressable
            onPress={() => navigation.navigate('DetalheDenuncia', { id: selecionada.id })}
            accessibilityRole="button"
            accessibilityLabel={`${tituloDeExibicao(selecionada)}. ${selecionada.status.rotulo}. Abrir detalhes.`}
            style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.9 }]}
          >
            <View style={estilos.iconeCartao}>
              <Icone nome={selecionada.categoria.icone} tamanho={22} cor={cores.folha} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Texto variante="corpoForte" numberOfLines={1}>
                {tituloDeExibicao(selecionada)}
              </Texto>
              <Texto variante="apoio" cor={cores.tintaSuave} numberOfLines={1}>
                {[formatarRegiao(selecionada.endereco), distancia ? `a ${distancia}` : null].filter(Boolean).join(', ')}
              </Texto>
              <View style={{ marginTop: 4 }}>
                <SeloStatus status={selecionada.status} />
              </View>
            </View>
            <Icone nome="chevron-right" tamanho={26} cor={cores.folha} />
          </Pressable>
        ) : !consulta.isPending ? (
          <View style={estilos.resumo} accessibilityLiveRegion="polite">
            <Texto variante="apoioForte" cor={cores.mata}>
              {denuncias.length === 0
                ? `Nenhuma denúncia em ${raioKm} km`
                : `${contar(denuncias.length, 'denúncia', 'denúncias')} em ${raioKm} km`}
            </Texto>
            {denuncias.length > 0 ? (
              <Texto variante="legenda" cor={cores.tintaSuave}>
                Toque em um marcador para ver a denúncia
              </Texto>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde titulo="Mapa da região">
        <SeletorDeRaio />
      </CabecalhoVerde>
      {corpo}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.nevoa,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
  legenda: {
    position: 'absolute',
    top: espaco.sm,
    left: espaco.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: raio.md,
    paddingVertical: espaco.xs,
    paddingHorizontal: espaco.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: cores.linha,
  },
  itemLegenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  carregando: {
    position: 'absolute',
    top: espaco.sm,
    right: espaco.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    backgroundColor: cores.branco,
    borderRadius: raio.pilula,
    paddingVertical: espaco.xs,
    paddingHorizontal: espaco.sm,
    borderWidth: 1,
    borderColor: cores.linha,
  },
  cartao: {
    position: 'absolute',
    left: espaco.sm,
    right: espaco.sm,
    bottom: espaco.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    padding: espaco.sm,
    borderWidth: 1,
    borderColor: cores.linha,
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  iconeCartao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumo: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: espaco.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: raio.md,
    paddingVertical: espaco.xs,
    paddingHorizontal: espaco.md,
    borderWidth: 1,
    borderColor: cores.linha,
  },
});
