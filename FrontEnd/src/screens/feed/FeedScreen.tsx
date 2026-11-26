import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mensagemDeErro } from '../../api/cliente';
import { BarraStatus } from '../../components/BarraStatus';
import { BotaoIcone } from '../../components/BotaoIcone';
import { CartaoDenuncia } from '../../components/CartaoDenuncia';
import { CurvasDeNivel } from '../../components/CurvasDeNivel';
import { EsqueletoDeCartao } from '../../components/Esqueleto';
import { EstadoVazio } from '../../components/EstadoVazio';
import { Simbolo } from '../../components/Logo';
import { SeletorDeRaio } from '../../components/SeletorDeRaio';
import { SemLocalizacao } from '../../components/SemLocalizacao';
import { Texto } from '../../components/Texto';
import { useUsuario } from '../../contexts/AuthContext';
import { useAvisos } from '../../contexts/AvisosContext';
import { useLocalizacao } from '../../contexts/LocalizacaoContext';
import { useDenunciasProximas } from '../../hooks/useDenuncias';
import { cores, espaco } from '../../theme';
import { compartilharDenuncia } from '../../utils/compartilhar';
import { Denuncia } from '../../utils/denuncia';
import { contar, distanciaKm, formatarDistancia } from '../../utils/formatadores';

/**
 * Início: feed regional (RF03).
 * Mostra as denúncias registradas dentro do raio escolhido em volta do usuário,
 * da mais recente para a mais antiga, com curtir, compartilhar e ver detalhes (RF11).
 */
export function FeedScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const usuario = useUsuario();
  const { avisar } = useAvisos();
  const { situacao, coordenadas, lugar, raioKm, atualizar } = useLocalizacao();
  const consulta = useDenunciasProximas(coordenadas, raioKm);
  const [atualizando, setAtualizando] = useState(false);

  const aoPuxar = useCallback(async () => {
    setAtualizando(true);
    await Promise.all([atualizar(), consulta.refetch()]);
    setAtualizando(false);
  }, [atualizar, consulta]);

  const abrir = useCallback((id: number) => navigation.navigate('DetalheDenuncia', { id }), [navigation]);

  const compartilhar = useCallback(
    (denuncia: Denuncia) => {
      compartilharDenuncia(denuncia).catch(() => avisar('Não foi possível abrir o compartilhamento.', 'erro'));
    },
    [avisar],
  );

  const renderizar = useCallback(
    ({ item }: { item: Denuncia }) => {
      const temPonto = coordenadas && item.endereco.latitude !== undefined && item.endereco.longitude !== undefined;
      const distancia = temPonto
        ? formatarDistancia(
            distanciaKm(coordenadas, { latitude: item.endereco.latitude!, longitude: item.endereco.longitude! }),
          )
        : undefined;
      return (
        <CartaoDenuncia
          denuncia={item}
          distancia={distancia}
          minha={item.autor?.id === usuario.idUsuario}
          aoAbrir={() => abrir(item.id)}
          aoCompartilhar={() => compartilhar(item)}
        />
      );
    },
    [coordenadas, usuario.idUsuario, abrir, compartilhar],
  );

  let corpo: React.ReactNode;
  if (!coordenadas && situacao === 'carregando') {
    corpo = <Carregando texto="Buscando sua localização…" />;
  } else if (!coordenadas && situacao !== 'ok') {
    corpo = <SemLocalizacao situacao={situacao as 'negada' | 'desligada' | 'erro'} />;
  } else if (consulta.isPending) {
    corpo = <Carregando texto="Carregando as denúncias da região…" />;
  } else if (consulta.isError) {
    corpo = (
      <EstadoVazio
        icone="cloud-off-outline"
        titulo="Não foi possível carregar as denúncias"
        texto={mensagemDeErro(consulta.error)}
        acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void consulta.refetch() }}
      />
    );
  } else {
    const lista = consulta.data ?? [];
    corpo = (
      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderizar}
        contentContainerStyle={[estilos.lista, lista.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoPuxar} tintColor={cores.folha} colors={[cores.folha]} />
        }
        ListHeaderComponent={
          lista.length > 0 ? (
            <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginBottom: espaco.sm }}>
              {contar(lista.length, 'denúncia', 'denúncias')} em um raio de {raioKm} km, da mais recente para a mais antiga
            </Texto>
          ) : undefined
        }
        ListEmptyComponent={
          <EstadoVazio
            icone="map-search-outline"
            titulo={`Nenhuma denúncia em ${raioKm} km`}
            texto="Aumente o raio de busca ou registre a primeira denúncia da sua região."
            acao={{ titulo: 'Registrar denúncia', icone: 'plus', onPress: () => navigation.navigate('NovaDenuncia') }}
          />
        }
        initialNumToRender={4}
        windowSize={7}
        testID="feed-lista"
      />
    );
  }

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <View style={[estilos.cabecalho, { paddingTop: insets.top + espaco.sm }]}>
        <CurvasDeNivel />
        <View style={estilos.linhaTitulo}>
          <Texto variante="titulo" cor={cores.branco} accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            Denúncias perto de você
          </Texto>
          <BotaoIcone
            icone="crosshairs-gps"
            rotulo="Atualizar minha localização"
            onPress={() => void aoPuxar()}
            cor={cores.branco}
            fundo="rgba(255,255,255,0.14)"
            tamanho={22}
          />
        </View>
        <View style={estilos.lugar}>
          <Simbolo tema="escuro" tamanho={20} />
          <Texto variante="apoio" cor={cores.menta} numberOfLines={1} style={{ flex: 1 }}>
            {lugar ?? (coordenadas ? 'Sua localização atual' : 'Localização não disponível')}
          </Texto>
        </View>
        <SeletorDeRaio />
      </View>
      <View style={{ flex: 1 }}>{corpo}</View>
    </View>
  );
}

function Carregando({ texto }: { texto: string }) {
  return (
    <View style={estilos.lista} accessibilityLiveRegion="polite">
      <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginBottom: espaco.sm }}>
        {texto}
      </Texto>
      <View style={{ gap: espaco.sm }}>
        <EsqueletoDeCartao />
        <EsqueletoDeCartao />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.nevoa,
  },
  cabecalho: {
    backgroundColor: cores.mata,
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.md,
    overflow: 'hidden',
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  lugar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  lista: {
    padding: espaco.md,
    paddingBottom: espaco.xl,
  },
});
