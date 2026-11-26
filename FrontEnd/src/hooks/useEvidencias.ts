import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { tamanhoDoArquivo } from '../utils/arquivos';
import { formatarTamanho } from '../utils/formatadores';
import { FotoPronta, prepararFoto } from '../utils/fotos';
import {
  extensaoDoArquivo,
  FORMATOS_DE_FOTO,
  FORMATOS_DE_VIDEO,
  MAX_FOTOS,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SEGUNDOS,
} from '../utils/midia';

export type VideoEscolhido = {
  uri: string;
  /** Tamanho em bytes (null quando o aparelho não informa). */
  bytes: number | null;
  duracaoMs: number | null;
  nome: string;
};

const TIPOS_DE_VIDEO = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

/**
 * Fotos (até 3) e vídeo (1, até 30 MB) de uma denúncia - RF05 e RF06.
 * Toda mídia é validada por formato e tamanho antes de entrar no formulário (RNF08).
 */
export function useEvidencias() {
  const [fotos, setFotos] = useState<FotoPronta[]>([]);
  const [video, setVideo] = useState<VideoEscolhido | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const vagas = MAX_FOTOS - fotos.length;

  const receberFotos = useCallback(
    async (itens: ImagePicker.ImagePickerAsset[]) => {
      setProcessando(true);
      setErro(null);
      try {
        const aceitas = itens.filter((item) => {
          const extensao = extensaoDoArquivo(item.fileName ?? item.uri);
          return (item.mimeType ?? '').startsWith('image/') || FORMATOS_DE_FOTO.includes(extensao);
        });
        if (aceitas.length < itens.length) {
          setErro('Um dos arquivos não é uma imagem aceita. Use fotos JPG, PNG ou HEIC.');
        }
        const prontas: FotoPronta[] = [];
        for (const item of aceitas.slice(0, vagas)) {
          prontas.push(await prepararFoto(item.uri, item.width, item.height));
        }
        if (aceitas.length > vagas) {
          setErro(`Cada denúncia aceita até ${MAX_FOTOS} fotos. As fotos a mais foram ignoradas.`);
        }
        if (prontas.length > 0) setFotos((atuais) => [...atuais, ...prontas].slice(0, MAX_FOTOS));
      } catch {
        setErro('Não foi possível preparar a foto. Tente escolher outra imagem.');
      } finally {
        setProcessando(false);
      }
    },
    [vagas],
  );

  const pedirCamera = useCallback(async (): Promise<boolean> => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      setErro('O EcoTec precisa da câmera para registrar a evidência. Permita o acesso nos ajustes do aparelho.');
      return false;
    }
    return true;
  }, []);

  const tirarFoto = useCallback(async () => {
    if (vagas <= 0) return;
    try {
      if (!(await pedirCamera())) return;
      const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (!resultado.canceled) await receberFotos(resultado.assets);
    } catch {
      setErro('Não foi possível abrir a câmera neste aparelho.');
    }
  }, [vagas, pedirCamera, receberFotos]);

  const escolherFotos = useCallback(async () => {
    if (vagas <= 0) return;
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: vagas > 1,
        selectionLimit: vagas,
        orderedSelection: true,
        quality: 0.85,
      });
      if (!resultado.canceled) await receberFotos(resultado.assets);
    } catch {
      setErro('Não foi possível abrir a galeria de fotos.');
    }
  }, [vagas, receberFotos]);

  const removerFoto = useCallback((uri: string) => {
    setFotos((atuais) => atuais.filter((f) => f.uri !== uri));
    setErro(null);
  }, []);

  const receberVideo = useCallback((item: ImagePicker.ImagePickerAsset) => {
    setErro(null);
    const extensao = extensaoDoArquivo(item.fileName ?? item.uri);
    const formatoAceito = FORMATOS_DE_VIDEO.includes(extensao) || TIPOS_DE_VIDEO.includes(item.mimeType ?? '');
    if (!formatoAceito) {
      setErro('Formato de vídeo não aceito. Use um vídeo MP4 ou MOV.');
      return;
    }
    const bytes = item.fileSize ?? tamanhoDoArquivo(item.uri);
    if (bytes !== null && bytes > MAX_VIDEO_BYTES) {
      setErro(`Este vídeo tem ${formatarTamanho(bytes)} e o limite é 30 MB. Escolha ou grave um vídeo mais curto.`);
      return;
    }
    setVideo({
      uri: item.uri,
      bytes,
      duracaoMs: item.duration ?? null,
      nome: item.fileName ?? `video.${extensao || 'mp4'}`,
    });
  }, []);

  const gravarVideo = useCallback(async () => {
    try {
      if (!(await pedirCamera())) return;
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: MAX_VIDEO_SEGUNDOS,
        // Qualidade média: arquivos leves, que carregam rápido no feed.
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });
      if (!resultado.canceled && resultado.assets[0]) receberVideo(resultado.assets[0]);
    } catch {
      setErro('Não foi possível abrir a câmera neste aparelho.');
    }
  }, [pedirCamera, receberVideo]);

  const escolherVideo = useCallback(async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      });
      if (!resultado.canceled && resultado.assets[0]) receberVideo(resultado.assets[0]);
    } catch {
      setErro('Não foi possível abrir a galeria de vídeos.');
    }
  }, [receberVideo]);

  const removerVideo = useCallback(() => {
    setVideo(null);
    setErro(null);
  }, []);

  return {
    fotos,
    video,
    vagas,
    processando,
    erro,
    limparErro: useCallback(() => setErro(null), []),
    tirarFoto,
    escolherFotos,
    removerFoto,
    gravarVideo,
    escolherVideo,
    removerVideo,
  };
}

export type Evidencias = ReturnType<typeof useEvidencias>;
