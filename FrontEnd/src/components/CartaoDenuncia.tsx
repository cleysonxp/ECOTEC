import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../theme';
import { Denuncia, tituloDeExibicao } from '../utils/denuncia';
import { formatarLogradouro, formatarRegiao, nomePublico, tempoDecorrido } from '../utils/formatadores';
import { BotaoCurtir } from './BotaoCurtir';
import { BotaoIcone } from './BotaoIcone';
import { Icone } from './Icone';
import { SeloStatus } from './Status';
import { Texto } from './Texto';

type Props = {
  denuncia: Denuncia;
  /** Distância até o usuário, já formatada (ex.: "1,2 km"). */
  distancia?: string;
  /** true quando a denúncia foi registrada pelo usuário atual. */
  minha?: boolean;
  aoAbrir: () => void;
  aoCompartilhar: () => void;
};

/** Publicação do feed regional: categoria, situação, texto, foto, local e interações. */
export const CartaoDenuncia = React.memo(function CartaoDenuncia({ denuncia, distancia, minha, aoAbrir, aoCompartilhar }: Props) {
  const titulo = tituloDeExibicao(denuncia);
  const regiao = formatarRegiao(denuncia.endereco) || formatarLogradouro(denuncia.endereco) || 'Local marcado no mapa';
  const quando = tempoDecorrido(denuncia.dataHora);
  const autor = minha ? 'Você' : denuncia.autor ? nomePublico(denuncia.autor.nome) : null;

  return (
    <View style={estilos.cartao}>
      <Pressable
        onPress={aoAbrir}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}. ${denuncia.categoria.nome}. ${denuncia.status.rotulo}. ${regiao}. ${quando}.`}
        accessibilityHint="Abre os detalhes da denúncia"
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <View style={estilos.topo}>
          <View style={estilos.icone}>
            <Icone nome={denuncia.categoria.icone} tamanho={20} cor={cores.folha} />
          </View>
          <View style={{ flex: 1 }}>
            <Texto variante="apoioForte" cor={cores.folha} numberOfLines={1}>
              {denuncia.categoria.curto}
            </Texto>
            <Texto variante="legenda" cor={cores.tintaSuave} numberOfLines={1}>
              {[autor, quando].filter(Boolean).join(', ')}
            </Texto>
          </View>
          <SeloStatus status={denuncia.status} />
        </View>

        <Texto variante="subtitulo" numberOfLines={2} style={{ marginTop: espaco.sm }}>
          {titulo}
        </Texto>
        {denuncia.descricao ? (
          <Texto variante="corpo" cor={cores.tintaSuave} numberOfLines={3} style={{ marginTop: 4 }}>
            {denuncia.descricao}
          </Texto>
        ) : null}

        {denuncia.imagemUri ? (
          <View style={estilos.midia}>
            <Image source={{ uri: denuncia.imagemUri }} style={estilos.imagem} resizeMode="cover" accessibilityIgnoresInvertColors />
            {denuncia.temVideo ? (
              <View style={estilos.seloVideo}>
                <Icone nome="play-circle" tamanho={16} cor={cores.branco} />
                <Texto variante="legenda" cor={cores.branco}>
                  Vídeo
                </Texto>
              </View>
            ) : null}
          </View>
        ) : denuncia.temVideo ? (
          <View style={estilos.somenteVideo}>
            <Icone nome="play-circle" tamanho={20} cor={cores.folha} />
            <Texto variante="apoioForte" cor={cores.folha}>
              Esta denúncia tem um vídeo
            </Texto>
          </View>
        ) : null}

        <View style={estilos.local}>
          <Icone nome="map-marker-outline" tamanho={18} cor={cores.tintaSuave} />
          <Texto variante="apoio" cor={cores.tintaSuave} numberOfLines={1} style={{ flex: 1 }}>
            {regiao}
          </Texto>
          {distancia ? (
            <Texto variante="apoioForte" cor={cores.mata}>
              a {distancia}
            </Texto>
          ) : null}
        </View>
      </Pressable>

      <View style={estilos.acoes}>
        <BotaoCurtir idDenuncia={denuncia.id} total={denuncia.curtidas} />
        <BotaoIcone icone="share-variant-outline" rotulo="Compartilhar denúncia" onPress={aoCompartilhar} cor={cores.tintaSuave} tamanho={22} />
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={aoAbrir}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ver detalhes da denúncia"
          style={({ pressed }) => [estilos.verMais, pressed && { opacity: 0.6 }]}
        >
          <Texto variante="apoioForte" cor={cores.folha}>
            Ver detalhes
          </Texto>
          <Icone nome="chevron-right" tamanho={20} cor={cores.folha} />
        </Pressable>
      </View>
    </View>
  );
});

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.md,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  midia: {
    marginTop: espaco.sm,
    borderRadius: raio.md,
    overflow: 'hidden',
    backgroundColor: cores.orvalho,
  },
  imagem: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  seloVideo: {
    position: 'absolute',
    left: espaco.xs,
    bottom: espaco.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 59, 44, 0.85)',
    borderRadius: raio.pilula,
    paddingHorizontal: espaco.xs,
    paddingVertical: 4,
  },
  somenteVideo: {
    marginTop: espaco.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    backgroundColor: cores.orvalho,
    borderRadius: raio.md,
    padding: espaco.sm,
  },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: espaco.sm,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    marginTop: espaco.sm,
    paddingTop: espaco.sm,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  verMais: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
});
