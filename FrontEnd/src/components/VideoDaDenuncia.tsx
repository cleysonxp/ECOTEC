import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../theme';
import { salvarVideoTemporario } from '../utils/arquivos';
import { bytesDoBase64 } from '../utils/midia';
import { formatarTamanho } from '../utils/formatadores';
import { Aviso } from './Aviso';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';

function Tocador({ uri }: { uri: string }) {
  const tocador = useVideoPlayer(uri, (t) => {
    t.loop = false;
    t.play();
  });
  return (
    <VideoView
      player={tocador}
      style={estilos.video}
      nativeControls
      contentFit="contain"
      accessibilityLabel="Vídeo da denúncia"
    />
  );
}

/**
 * Vídeo anexado à denúncia (RF06).
 * O arquivo só é preparado quando o usuário pede para assistir, para a tela abrir rápido.
 */
export function VideoDaDenuncia({ idDenuncia, base64 }: { idDenuncia: number; base64: string }) {
  const [uri, setUri] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [erro, setErro] = useState(false);

  const assistir = async () => {
    setPreparando(true);
    setErro(false);
    try {
      setUri(await salvarVideoTemporario(idDenuncia, base64));
    } catch {
      setErro(true);
    } finally {
      setPreparando(false);
    }
  };

  if (uri) return <Tocador uri={uri} />;

  return (
    <View style={estilos.caixa}>
      <View style={estilos.linha}>
        <View style={estilos.icone}>
          <Icone nome="play-circle" tamanho={26} cor={cores.folha} />
        </View>
        <View style={{ flex: 1 }}>
          <Texto variante="corpoForte">Vídeo da ocorrência</Texto>
          <Texto variante="apoio" cor={cores.tintaSuave}>
            {formatarTamanho(bytesDoBase64(base64))}
          </Texto>
        </View>
      </View>
      {erro ? (
        <Aviso tipo="erro">Não foi possível preparar o vídeo neste aparelho. Tente de novo.</Aviso>
      ) : null}
      <Botao titulo="Assistir ao vídeo" icone="play-circle" variante="secundario" onPress={assistir} carregando={preparando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    gap: espaco.sm,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: raio.lg,
    padding: espaco.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  icone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: raio.lg,
    backgroundColor: '#05140F',
    overflow: 'hidden',
  },
});
