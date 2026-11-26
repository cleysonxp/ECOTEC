import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mensagemDeErro } from '../../api/cliente';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { BotaoCurtir } from '../../components/BotaoCurtir';
import { BotaoIcone } from '../../components/BotaoIcone';
import { CurvasDeNivel } from '../../components/CurvasDeNivel';
import { Esqueleto } from '../../components/Esqueleto';
import { EstadoVazio } from '../../components/EstadoVazio';
import { Icone, NomeIcone } from '../../components/Icone';
import { ImagemAmpliada } from '../../components/ImagemAmpliada';
import { MapaDoLocal } from '../../components/Mapa';
import { TrilhaStatus } from '../../components/Status';
import { Texto } from '../../components/Texto';
import { VideoDaDenuncia } from '../../components/VideoDaDenuncia';
import { useUsuario } from '../../contexts/AuthContext';
import { useAvisos } from '../../contexts/AvisosContext';
import { useDenuncia } from '../../hooks/useDenuncias';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco, raio } from '../../theme';
import { abrirNoMapa, compartilharDenuncia } from '../../utils/compartilhar';
import { tituloDeExibicao } from '../../utils/denuncia';
import { formatarDataHora, formatarLogradouro, formatarRegiao, mascararCep, nomePublico } from '../../utils/formatadores';

/** Detalhe: todas as informações de uma denúncia publicada (RF11). */
export function DetalheDenunciaScreen({ navigation, route }: TelaProps<'DetalheDenuncia'>) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const usuario = useUsuario();
  const { avisar } = useAvisos();
  const consulta = useDenuncia(id);
  const [fotoAberta, setFotoAberta] = useState(false);

  const voltar = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Abas'));
  const denuncia = consulta.data;

  const compartilhar = () => {
    if (!denuncia) return;
    compartilharDenuncia(denuncia).catch(() => avisar('Não foi possível abrir o compartilhamento.', 'erro'));
  };

  if (!denuncia) {
    return (
      <View style={estilos.tela}>
        <BarraStatus estilo="dark" />
        <View style={[estilos.barraSimples, { paddingTop: insets.top + espaco.xs }]}>
          <BotaoIcone icone="arrow-left" rotulo="Voltar" onPress={voltar} />
        </View>
        {consulta.isError ? (
          <EstadoVazio
            icone="cloud-off-outline"
            titulo="Não foi possível abrir a denúncia"
            texto={mensagemDeErro(consulta.error)}
            acao={{ titulo: 'Tentar de novo', icone: 'reload', onPress: () => void consulta.refetch() }}
            acaoSecundaria={{ titulo: 'Voltar', onPress: voltar }}
          />
        ) : (
          <View style={{ padding: espaco.lg, gap: espaco.md }} accessible accessibilityLabel="Carregando denúncia">
            <Esqueleto style={{ height: 220, borderRadius: raio.lg }} />
            <Esqueleto style={{ height: 26, width: '70%' }} />
            <Esqueleto style={{ height: 16, width: '45%' }} />
            <Esqueleto style={{ height: 90, borderRadius: raio.lg }} />
            <Esqueleto style={{ height: 16 }} />
            <Esqueleto style={{ height: 16, width: '85%' }} />
          </View>
        )}
      </View>
    );
  }

  const titulo = tituloDeExibicao(denuncia);
  const minha = denuncia.autor?.id === usuario.idUsuario;
  const { latitude, longitude } = denuncia.endereco;
  const ponto = latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null;
  const logradouro = formatarLogradouro(denuncia.endereco);
  const regiao = formatarRegiao(denuncia.endereco);
  const cep = denuncia.endereco.cep ? mascararCep(denuncia.endereco.cep) : '';

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: espaco.xl }} showsVerticalScrollIndicator={false}>
        {denuncia.imagemUri ? (
          <Pressable
            onPress={() => setFotoAberta(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Foto da denúncia. Toque para ampliar."
          >
            <Image source={{ uri: denuncia.imagemUri }} style={estilos.foto} resizeMode="cover" accessibilityIgnoresInvertColors />
            <View style={estilos.veuDaFoto} pointerEvents="none" />
            <View style={estilos.dicaAmpliar} pointerEvents="none">
              <Icone nome="magnify" tamanho={16} cor={cores.branco} />
              <Texto variante="legenda" cor={cores.branco}>
                Ampliar
              </Texto>
            </View>
          </Pressable>
        ) : (
          <View style={[estilos.semFoto, { paddingTop: insets.top + 56 }]}>
            <CurvasDeNivel />
            <View style={estilos.iconeGrande}>
              <Icone nome={denuncia.categoria.icone} tamanho={38} cor={cores.mata} />
            </View>
          </View>
        )}

        <View style={estilos.conteudo}>
          <View style={estilos.categoria}>
            <Icone nome={denuncia.categoria.icone} tamanho={18} cor={cores.folha} />
            <Texto variante="apoioForte" cor={cores.folha} style={{ flex: 1 }}>
              {denuncia.categoria.nome}
            </Texto>
          </View>

          <Texto variante="destaque" accessibilityRole="header" style={{ marginTop: espaco.xs }}>
            {titulo}
          </Texto>

          <View style={estilos.meta}>
            <Linha icone="calendar-clock-outline" texto={`Registrada em ${formatarDataHora(denuncia.dataHora)}`} />
            {denuncia.autor ? (
              <Linha icone="account-outline" texto={minha ? 'Registrada por você' : `Registrada por ${nomePublico(denuncia.autor.nome)}`} />
            ) : null}
            <Linha icone="file-document-outline" texto={`Protocolo nº ${denuncia.id}`} />
          </View>

          <View style={estilos.bloco}>
            <Texto variante="subtitulo" accessibilityRole="header">
              Situação
            </Texto>
            <View style={{ marginTop: espaco.md }}>
              <TrilhaStatus status={denuncia.status} />
            </View>
          </View>

          <View style={estilos.secao}>
            <Texto variante="subtitulo" accessibilityRole="header">
              O que aconteceu
            </Texto>
            <Texto variante="corpo" cor={cores.tinta} style={{ marginTop: espaco.xs }} selectable>
              {denuncia.descricao || 'Sem descrição.'}
            </Texto>
          </View>

          {denuncia.videoBase64 ? (
            <View style={estilos.secao}>
              <VideoDaDenuncia idDenuncia={denuncia.id} base64={denuncia.videoBase64} />
            </View>
          ) : null}

          <View style={estilos.secao}>
            <Texto variante="subtitulo" accessibilityRole="header">
              Onde foi
            </Texto>
            <View style={{ marginTop: espaco.xs, gap: 2 }}>
              {logradouro ? <Texto variante="corpoForte">{logradouro}</Texto> : null}
              {regiao ? (
                <Texto variante="corpo" cor={cores.tintaSuave}>
                  {regiao}
                </Texto>
              ) : null}
              {cep ? (
                <Texto variante="corpo" cor={cores.tintaSuave}>
                  CEP {cep}
                </Texto>
              ) : null}
              {!logradouro && !regiao ? (
                <Texto variante="corpo" cor={cores.tintaSuave}>
                  Endereço não informado. O local foi marcado pelas coordenadas do GPS.
                </Texto>
              ) : null}
              {denuncia.endereco.pontoReferencia ? (
                <Texto variante="corpo" cor={cores.tintaSuave} style={{ marginTop: 4 }}>
                  Ponto de referência: {denuncia.endereco.pontoReferencia}
                </Texto>
              ) : null}
            </View>

            {ponto ? (
              <View style={{ marginTop: espaco.sm, gap: espaco.sm }}>
                <View style={estilos.mapa}>
                  <MapaDoLocal ponto={ponto} style={{ flex: 1 }} />
                </View>
                <Texto variante="legenda" cor={cores.tintaSuave}>
                  Coordenadas: {ponto.latitude.toFixed(5)}, {ponto.longitude.toFixed(5)}
                </Texto>
                <Botao
                  titulo="Abrir no aplicativo de mapas"
                  icone="open-in-new"
                  variante="suave"
                  compacto
                  onPress={() => abrirNoMapa(ponto, titulo).catch(() => avisar('Não foi possível abrir o mapa.', 'erro'))}
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Botões sobre a foto */}
      <View style={[estilos.flutuantes, { top: insets.top + espaco.xs }]} pointerEvents="box-none">
        <BotaoIcone icone="arrow-left" rotulo="Voltar" onPress={voltar} cor={cores.mata} fundo={cores.branco} style={estilos.sombra} />
        <BotaoIcone
          icone="share-variant-outline"
          rotulo="Compartilhar denúncia"
          onPress={compartilhar}
          cor={cores.mata}
          fundo={cores.branco}
          tamanho={22}
          style={estilos.sombra}
        />
      </View>

      <View style={[estilos.rodape, { paddingBottom: Math.max(insets.bottom, espaco.sm) }]}>
        <View style={{ flex: 1 }}>
          <BotaoCurtir idDenuncia={denuncia.id} total={denuncia.curtidas} grande />
        </View>
        <Botao titulo="Compartilhar" icone="share-variant-outline" variante="secundario" onPress={compartilhar} style={{ flex: 1 }} />
      </View>

      <ImagemAmpliada uri={denuncia.imagemUri} visivel={fotoAberta} aoFechar={() => setFotoAberta(false)} />
    </View>
  );
}

function Linha({ icone, texto }: { icone: NomeIcone; texto: string }) {
  return (
    <View style={estilos.linhaMeta}>
      <Icone nome={icone} tamanho={18} cor={cores.tintaSuave} />
      <Texto variante="apoio" cor={cores.tintaSuave} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  barraSimples: {
    paddingHorizontal: espaco.sm,
  },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: cores.orvalho,
  },
  veuDaFoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: 'rgba(11, 59, 44, 0.28)',
  },
  dicaAmpliar: {
    position: 'absolute',
    right: espaco.sm,
    bottom: espaco.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 59, 44, 0.8)',
    borderRadius: raio.pilula,
    paddingHorizontal: espaco.xs,
    paddingVertical: 5,
  },
  semFoto: {
    backgroundColor: cores.mata,
    alignItems: 'center',
    paddingBottom: espaco.xl,
    overflow: 'hidden',
  },
  iconeGrande: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: cores.menta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.lg,
  },
  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    marginTop: espaco.sm,
    gap: 6,
  },
  linhaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  bloco: {
    marginTop: espaco.lg,
    backgroundColor: cores.nevoa,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.md,
  },
  secao: {
    marginTop: espaco.xl,
  },
  mapa: {
    height: 170,
    borderRadius: raio.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.linha,
  },
  flutuantes: {
    position: 'absolute',
    left: espaco.md,
    right: espaco.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sombra: {
    shadowColor: cores.sombra,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  rodape: {
    flexDirection: 'row',
    gap: espaco.sm,
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.sm,
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
});
