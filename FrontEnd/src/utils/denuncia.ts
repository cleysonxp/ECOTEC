import type { DenunciaDetalheApi, DenunciaProximaApi, MinhaDenunciaApi } from '../api/tipos';
import { Categoria, categoriaPorDescricao } from './categorias';
import { interpretarData } from './formatadores';
import { uriDeImagemBase64 } from './midia';
import { InfoStatus, interpretarStatus } from './status';
import { LIMITES } from './validacao';

/** Denúncia já preparada para as telas (datas, categoria, status e imagem resolvidos). */
export interface Denuncia {
  id: number;
  /** Título informado no registro, quando houver. */
  titulo: string | null;
  descricao: string;
  categoria: Categoria;
  dataHora: Date | null;
  /** Imagem pronta para o componente Image (data URI). */
  imagemUri: string | null;
  temVideo: boolean;
  status: InfoStatus;
  autor: { id: number; nome: string } | null;
  endereco: {
    cep?: string;
    estado?: string;
    cidade: string;
    bairro: string;
    rua: string;
    numero: number;
    pontoReferencia?: string;
    latitude?: number;
    longitude?: number;
  };
  curtidas: number;
}

/** Denúncia completa, com o vídeo em base64 (só a tela de detalhe usa). */
export interface DenunciaCompleta extends Denuncia {
  videoBase64: string | null;
}

/**
 * O back-end guarda um único texto (Descricao). Para atender ao título previsto na documentação,
 * o app grava o título na primeira linha e a descrição nas linhas seguintes.
 */
export function juntarTituloEDescricao(titulo: string, descricao: string): string {
  const t = titulo.replace(/\s+/g, ' ').trim();
  const d = descricao.trim();
  return t ? `${t}\n${d}` : d;
}

export function separarTituloEDescricao(texto: string): { titulo: string | null; descricao: string } {
  const bruto = (texto ?? '').trim();
  const quebra = bruto.indexOf('\n');
  if (quebra > 0) {
    const primeira = bruto.slice(0, quebra).trim();
    const resto = bruto.slice(quebra + 1).trim();
    if (primeira.length > 0 && primeira.length <= LIMITES.titulo && resto.length > 0) {
      return { titulo: primeira, descricao: resto };
    }
  }
  return { titulo: null, descricao: bruto };
}

/** Título para exibir: o informado ou, se a denúncia não tiver um, o nome da categoria. */
export function tituloDeExibicao(denuncia: Pick<Denuncia, 'titulo' | 'categoria'>): string {
  return denuncia.titulo ?? denuncia.categoria.curto;
}

type Origem = DenunciaProximaApi | DenunciaDetalheApi | MinhaDenunciaApi;

export function paraDenuncia(origem: Origem): Denuncia {
  const { titulo, descricao } = separarTituloEDescricao(origem.descricao);
  const endereco = origem.endereco ?? { cidade: '', bairro: '', rua: '', numero: 0 };
  const latitude = 'latitude' in endereco ? Number(endereco.latitude) : undefined;
  const longitude = 'longitude' in endereco ? Number(endereco.longitude) : undefined;

  return {
    id: origem.id,
    titulo,
    descricao,
    categoria: categoriaPorDescricao(origem.tipo),
    dataHora: interpretarData(origem.dataHora),
    imagemUri: uriDeImagemBase64(origem.imagem),
    temVideo: !!origem.video,
    status: interpretarStatus(origem.status),
    autor: 'usuario' in origem && origem.usuario ? { id: origem.usuario.id, nome: origem.usuario.nome } : null,
    endereco: {
      cep: 'cep' in endereco ? endereco.cep : undefined,
      estado: 'estado' in endereco ? endereco.estado : undefined,
      cidade: endereco.cidade ?? '',
      bairro: endereco.bairro ?? '',
      rua: endereco.rua ?? '',
      numero: Number(endereco.numero ?? 0),
      pontoReferencia: 'pontoReferencia' in endereco ? endereco.pontoReferencia : undefined,
      latitude: Number.isFinite(latitude) ? latitude : undefined,
      longitude: Number.isFinite(longitude) ? longitude : undefined,
    },
    curtidas: Number(origem.quantidadeLikes ?? 0),
  };
}

export function paraDenunciaCompleta(origem: DenunciaDetalheApi): DenunciaCompleta {
  return { ...paraDenuncia(origem), videoBase64: origem.video ?? null };
}
