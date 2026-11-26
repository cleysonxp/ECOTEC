import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Evidencias } from '../../hooks/useEvidencias';
import { cores, espaco, raio } from '../../theme';
import { formatarDuracao, formatarTamanho } from '../../utils/formatadores';
import { MAX_FOTOS, MAX_VIDEO_SEGUNDOS } from '../../utils/midia';
import { Aviso } from '../Aviso';
import { BotaoIcone } from '../BotaoIcone';
import { FolhaDeAcoes } from '../FolhaDeAcoes';
import { Icone } from '../Icone';
import { Mosaico } from '../Mosaico';
import { Texto } from '../Texto';

/** Fotos (até 3) e vídeo (1) da denúncia, com escolha entre câmera e galeria. */
export function SecaoEvidencias({ evidencias, desabilitada }: { evidencias: Evidencias; desabilitada?: boolean }) {
  const { width } = useWindowDimensions();
  const [folha, setFolha] = useState<'foto' | 'video' | null>(null);
  const { fotos, video, vagas, processando, erro } = evidencias;
  const larguraDaPrevia = Math.min(width - espaco.lg * 2, 520);

  return (
    <View style={{ gap: espaco.md }}>
      {/* Fotos */}
      <View>
        <View style={estilos.titulo}>
          <Texto variante="corpoForte">Fotos</Texto>
          <Texto variante="apoio" cor={cores.tintaSuave}>
            {fotos.length} de {MAX_FOTOS}
          </Texto>
        </View>

        <View style={estilos.miniaturas}>
          {fotos.map((foto, indice) => (
            <View key={foto.uri} style={estilos.miniatura}>
              <Image
                source={{ uri: foto.uri }}
                style={estilos.imagemMiniatura}
                resizeMode="cover"
                accessibilityLabel={`Foto ${indice + 1} da denúncia`}
              />
              <BotaoIcone
                icone="close"
                rotulo={`Remover foto ${indice + 1}`}
                onPress={() => evidencias.removerFoto(foto.uri)}
                cor={cores.branco}
                fundo="rgba(11, 59, 44, 0.85)"
                tamanho={16}
                style={estilos.remover}
                desabilitado={desabilitada}
              />
            </View>
          ))}

          {vagas > 0 ? (
            <Pressable
              onPress={() => setFolha('foto')}
              disabled={desabilitada || processando}
              accessibilityRole="button"
              accessibilityLabel={fotos.length === 0 ? 'Adicionar foto' : 'Adicionar outra foto'}
              accessibilityHint={`Você pode anexar até ${MAX_FOTOS} fotos`}
              style={({ pressed }) => [estilos.adicionar, fotos.length === 0 && estilos.adicionarLargo, pressed && { backgroundColor: cores.orvalho }]}
              testID="evidencias-adicionar-foto"
            >
              {processando ? (
                <ActivityIndicator color={cores.folha} />
              ) : (
                <Icone nome="camera-outline" tamanho={26} cor={cores.folha} />
              )}
              <Texto variante="apoioForte" cor={cores.folha} centro>
                {processando ? 'Preparando…' : fotos.length === 0 ? 'Adicionar foto' : 'Adicionar'}
              </Texto>
            </Pressable>
          ) : null}
        </View>

        {fotos.length >= 2 ? (
          <View style={{ marginTop: espaco.sm, gap: 6 }}>
            <Mosaico
              fotos={fotos.map((f) => f.uri)}
              largura={larguraDaPrevia}
              altura={larguraDaPrevia * 0.75}
              raioDaBorda={raio.md}
            />
            <Texto variante="apoio" cor={cores.tintaSuave}>
              As {fotos.length} fotos são enviadas juntas, em uma única imagem, como aparece acima.
            </Texto>
          </View>
        ) : null}
      </View>

      {/* Vídeo */}
      <View>
        <View style={estilos.titulo}>
          <Texto variante="corpoForte">Vídeo</Texto>
          <Texto variante="apoio" cor={cores.tintaSuave}>
            1 vídeo, até 30 MB
          </Texto>
        </View>

        {video ? (
          <View style={estilos.video}>
            <View style={estilos.iconeVideo}>
              <Icone nome="video-outline" tamanho={24} cor={cores.folha} />
            </View>
            <View style={{ flex: 1 }}>
              <Texto variante="corpoForte" numberOfLines={1}>
                Vídeo anexado
              </Texto>
              <Texto variante="apoio" cor={cores.tintaSuave} numberOfLines={1}>
                {[
                  video.duracaoMs ? formatarDuracao(video.duracaoMs) : null,
                  video.bytes !== null ? formatarTamanho(video.bytes) : null,
                ]
                  .filter(Boolean)
                  .join(', ') || video.nome}
              </Texto>
            </View>
            <BotaoIcone
              icone="trash-can-outline"
              rotulo="Remover vídeo"
              onPress={evidencias.removerVideo}
              cor={cores.erro}
              desabilitado={desabilitada}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => setFolha('video')}
            disabled={desabilitada}
            accessibilityRole="button"
            accessibilityLabel="Adicionar vídeo"
            accessibilityHint="Um vídeo por denúncia, com até 30 megabytes"
            style={({ pressed }) => [estilos.adicionar, estilos.adicionarLargo, pressed && { backgroundColor: cores.orvalho }]}
            testID="evidencias-adicionar-video"
          >
            <Icone nome="video-plus-outline" tamanho={26} cor={cores.folha} />
            <Texto variante="apoioForte" cor={cores.folha}>
              Adicionar vídeo
            </Texto>
          </Pressable>
        )}
      </View>

      {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}

      <FolhaDeAcoes
        visivel={folha === 'foto'}
        titulo="Adicionar foto"
        texto={`Você pode anexar até ${MAX_FOTOS} fotos por denúncia.`}
        aoFechar={() => setFolha(null)}
        acoes={[
          { titulo: 'Tirar foto', descricao: 'Abrir a câmera agora', icone: 'camera-outline', onPress: () => void evidencias.tirarFoto() },
          {
            titulo: 'Escolher da galeria',
            descricao: vagas > 1 ? `Selecione até ${vagas} fotos` : 'Selecione 1 foto',
            icone: 'image-multiple-outline',
            onPress: () => void evidencias.escolherFotos(),
          },
        ]}
      />
      <FolhaDeAcoes
        visivel={folha === 'video'}
        titulo="Adicionar vídeo"
        texto="Um vídeo por denúncia, em MP4 ou MOV, com até 30 MB."
        aoFechar={() => setFolha(null)}
        acoes={[
          {
            titulo: 'Gravar vídeo',
            descricao: `Gravação de até ${MAX_VIDEO_SEGUNDOS} segundos`,
            icone: 'video-outline',
            onPress: () => void evidencias.gravarVideo(),
          },
          { titulo: 'Escolher da galeria', descricao: 'Usar um vídeo já gravado', icone: 'image-multiple-outline', onPress: () => void evidencias.escolherVideo() },
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  titulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: espaco.xs,
  },
  miniaturas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.xs,
  },
  miniatura: {
    width: 92,
    height: 92,
    borderRadius: raio.md,
    overflow: 'hidden',
    backgroundColor: cores.orvalho,
  },
  imagemMiniatura: {
    width: '100%',
    height: '100%',
  },
  remover: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  adicionar: {
    width: 92,
    minHeight: 92,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.folha,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: espaco.xs,
  },
  adicionarLargo: {
    width: '100%',
    minHeight: 76,
    flexDirection: 'row',
    gap: espaco.xs,
  },
  video: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: raio.md,
    padding: espaco.sm,
    backgroundColor: cores.branco,
  },
  iconeVideo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
