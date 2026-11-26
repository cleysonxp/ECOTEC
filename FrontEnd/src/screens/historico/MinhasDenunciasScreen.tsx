import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { mensagemDeErro } from '../../api/cliente';
import { BarraStatus } from '../../components/BarraStatus';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Esqueleto } from '../../components/Esqueleto';
import { EstadoVazio } from '../../components/EstadoVazio';
import { Icone } from '../../components/Icone';
import { Pilula } from '../../components/Selecao';
import { SeloStatus } from '../../components/Status';
import { Texto } from '../../components/Texto';
import { useMinhasDenuncias } from '../../hooks/useDenuncias';
import { cores, espaco, raio } from '../../theme';
import { Denuncia, tituloDeExibicao } from '../../utils/denuncia';
import { contar, formatarDataHora, formatarEnderecoCompleto } from '../../utils/formatadores';
import { ETAPAS_DO_STATUS } from '../../utils/status';

type Filtro = 'todas' | 0 | 1 | 2;

/**
 * Minhas denúncias: histórico do usuário (RF10),
 * com a situação de cada registro - Recebida, Em análise ou Resolvida.
 */
export function MinhasDenunciasScreen() {
  const navigation = useNavigation();
  const consulta = useMinhasDenuncias();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [atualizando, setAtualizando] = useState(false);

  const todas = consulta.data ?? [];
  const totais = useMemo(
    () => [0, 1, 2].map((etapa) => todas.filter((d) => d.status.etapa === etapa).length),
    [todas],
  );
  const visiveis = filtro === 'todas' ? todas : todas.filter((d) => d.status.etapa === filtro);

  const aoPuxar = async () => {
    setAtualizando(true);
    await consulta.refetch();
    setAtualizando(false);
  };

  let corpo: React.ReactNode;
  if (consulta.isPending) {
    corpo = (
      <View style={estilos.lista} accessible accessibilityLabel="Carregando suas denúncias">
        {[0, 1, 2].map((i) => (
          <View key={i} style={[estilos.item, { marginBottom: espaco.sm }]}>
            <Esqueleto style={{ width: 68, height: 68, borderRadius: raio.md }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Esqueleto style={{ height: 16, width: '75%' }} />
              <Esqueleto style={{ height: 12, width: '50%' }} />
              <Esqueleto style={{ height: 22, width: 96, borderRadius: 11 }} />
            </View>
          </View>
        ))}
      </View>
    );
  } else if (consulta.isError) {
    corpo = (
      <EstadoVazio
        icone="cloud-off-outline"
        titulo="Não foi possível carregar seu histórico"
        texto={mensagemDeErro(consulta.error)}
        acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void consulta.refetch() }}
      />
    );
  } else {
    corpo = (
      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemDoHistorico denuncia={item} aoAbrir={() => navigation.navigate('DetalheDenuncia', { id: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        contentContainerStyle={[estilos.lista, visiveis.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoPuxar} tintColor={cores.folha} colors={[cores.folha]} />
        }
        ListEmptyComponent={
          todas.length === 0 ? (
            <EstadoVazio
              icone="clipboard-text-clock-outline"
              titulo="Você ainda não registrou denúncias"
              texto="Quando registrar, elas aparecem aqui com a situação de cada uma."
              acao={{ titulo: 'Registrar denúncia', icone: 'plus', onPress: () => navigation.navigate('NovaDenuncia') }}
            />
          ) : (
            <EstadoVazio
              icone="format-list-bulleted"
              titulo="Nenhuma denúncia nesta situação"
              texto="Escolha outra situação para ver o restante do seu histórico."
              acaoSecundaria={{ titulo: 'Ver todas', onPress: () => setFiltro('todas') }}
            />
          )
        }
        testID="historico-lista"
      />
    );
  }

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde
        titulo="Minhas denúncias"
        subtitulo={
          consulta.isSuccess
            ? todas.length === 0
              ? 'Nenhum registro até agora'
              : `${contar(todas.length, 'registro', 'registros')} no seu histórico`
            : undefined
        }
      />

      {todas.length > 0 ? (
        <View style={estilos.filtros}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: espaco.md, gap: espaco.xs }}
            accessibilityRole="radiogroup"
            accessibilityLabel="Filtrar por situação"
          >
            <Pilula rotulo={`Todas (${todas.length})`} selecionada={filtro === 'todas'} onPress={() => setFiltro('todas')} />
            {ETAPAS_DO_STATUS.map((etapa, indice) => (
              <Pilula
                key={etapa}
                rotulo={`${etapa} (${totais[indice]})`}
                selecionada={filtro === indice}
                onPress={() => setFiltro(indice as 0 | 1 | 2)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ flex: 1 }}>{corpo}</View>
    </View>
  );
}

function ItemDoHistorico({ denuncia, aoAbrir }: { denuncia: Denuncia; aoAbrir: () => void }) {
  const titulo = tituloDeExibicao(denuncia);
  const endereco = formatarEnderecoCompleto(denuncia.endereco);
  return (
    <Pressable
      onPress={aoAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${denuncia.status.rotulo}. Registrada em ${formatarDataHora(denuncia.dataHora)}.`}
      accessibilityHint="Abre os detalhes da denúncia"
      style={({ pressed }) => [estilos.item, pressed && { backgroundColor: cores.orvalho }]}
    >
      {denuncia.imagemUri ? (
        <Image source={{ uri: denuncia.imagemUri }} style={estilos.miniatura} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={[estilos.miniatura, estilos.semFoto]}>
          <Icone nome={denuncia.categoria.icone} tamanho={28} cor={cores.folha} />
        </View>
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <Texto variante="corpoForte" numberOfLines={2}>
          {titulo}
        </Texto>
        <Texto variante="apoio" cor={cores.tintaSuave} numberOfLines={1}>
          {denuncia.categoria.curto}
        </Texto>
        <Texto variante="legenda" cor={cores.tintaSuave} numberOfLines={1}>
          {formatarDataHora(denuncia.dataHora)}
        </Texto>
        {endereco ? (
          <Texto variante="legenda" cor={cores.tintaSuave} numberOfLines={1}>
            {endereco}
          </Texto>
        ) : null}
        <View style={estilos.rodapeItem}>
          <SeloStatus status={denuncia.status} />
          <View style={estilos.curtidas} accessible accessibilityLabel={contar(denuncia.curtidas, 'curtida', 'curtidas')}>
            <Icone nome="heart-outline" tamanho={15} cor={cores.tintaSuave} />
            <Texto variante="legenda" cor={cores.tintaSuave}>
              {denuncia.curtidas}
            </Texto>
          </View>
        </View>
      </View>
      <Icone nome="chevron-right" tamanho={22} cor={cores.tintaFraca} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.nevoa,
  },
  filtros: {
    paddingVertical: espaco.sm,
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
  },
  lista: {
    padding: espaco.md,
    paddingBottom: espaco.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.sm,
  },
  miniatura: {
    width: 76,
    height: 76,
    borderRadius: raio.md,
    backgroundColor: cores.orvalho,
  },
  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  curtidas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
