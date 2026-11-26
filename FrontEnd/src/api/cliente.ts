import axios, { AxiosError } from 'axios';

/**
 * Cliente HTTP único do app (axios).
 * - Envia o token JWT em todas as requisições autenticadas.
 * - Converte qualquer falha em ErroApi, com mensagem pronta para mostrar ao usuário.
 * - Avisa o app quando o servidor responde 401 a uma sessão em uso (token expirado).
 *
 * Este arquivo não depende do Expo de propósito: assim os serviços podem ser testados fora do aparelho.
 */

export type TipoDeErro = 'rede' | 'tempo' | 'http' | 'cancelado' | 'desconhecido';

export class ErroApi extends Error {
  tipo: TipoDeErro;
  /** Código HTTP, quando o servidor respondeu. */
  status?: number;
  /** Mensagem enviada pelo back-end, quando houver. */
  mensagemDoServidor?: string;

  constructor(tipo: TipoDeErro, mensagem: string, status?: number, mensagemDoServidor?: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.tipo = tipo;
    this.status = status;
    this.mensagemDoServidor = mensagemDoServidor;
  }
}

export const TEMPO_LIMITE_PADRAO = 15000;
/** Envio de denúncia com foto e vídeo pode demorar em redes lentas. */
export const TEMPO_LIMITE_ENVIO = 120000;

export const api = axios.create({
  timeout: TEMPO_LIMITE_PADRAO,
  headers: { Accept: 'application/json' },
});

let tokenAtual: string | null = null;
let avisarSessaoExpirada: (() => void) | null = null;

export function configurarUrlDaApi(url: string) {
  api.defaults.baseURL = url.replace(/\/+$/, '');
}

export function urlDaApi(): string {
  return api.defaults.baseURL ?? '';
}

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export function aoExpirarSessao(funcao: (() => void) | null) {
  avisarSessaoExpirada = funcao;
}

api.interceptors.request.use((config) => {
  if (tokenAtual) {
    config.headers.set('Authorization', `Bearer ${tokenAtual}`);
  }
  return config;
});

/** O back-end responde ora com texto, ora com { mensagem }, ora sem corpo. */
function extrairMensagem(dados: unknown): string | undefined {
  if (typeof dados === 'string') {
    const texto = dados.trim();
    // Ignora páginas de erro e rastros de pilha: não servem para o usuário.
    if (texto.length > 0 && texto.length <= 200 && !texto.startsWith('<') && !texto.includes('   at ')) {
      return texto;
    }
    return undefined;
  }
  if (dados && typeof dados === 'object') {
    const obj = dados as Record<string, unknown>;
    for (const chave of ['mensagem', 'message', 'detail', 'title']) {
      const valor = obj[chave];
      if (typeof valor === 'string' && valor.trim().length > 0) return valor.trim();
    }
  }
  return undefined;
}

function mensagemPadrao(status: number): string {
  if (status === 400) return 'O servidor não aceitou os dados enviados. Revise as informações e tente de novo.';
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === 403) return 'Você não tem permissão para fazer isso.';
  if (status === 404) return 'Não encontramos o que você procurava.';
  if (status === 413) return 'O arquivo é grande demais para o servidor. Tente um vídeo mais curto ou menos fotos.';
  if (status >= 500) return 'O servidor encontrou um problema. Tente de novo em instantes.';
  return 'Não foi possível concluir a operação. Tente de novo.';
}

export function paraErroApi(erro: unknown): ErroApi {
  if (erro instanceof ErroApi) return erro;

  if (axios.isCancel(erro)) {
    return new ErroApi('cancelado', 'Operação cancelada.');
  }

  if (axios.isAxiosError(erro)) {
    const e = erro as AxiosError;
    if (e.response) {
      const status = e.response.status;
      const doServidor = extrairMensagem(e.response.data);
      return new ErroApi('http', doServidor ?? mensagemPadrao(status), status, doServidor);
    }
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') {
      return new ErroApi('tempo', 'O servidor demorou para responder. Tente de novo.');
    }
    return new ErroApi(
      'rede',
      'Não foi possível falar com o servidor. Confira sua conexão e se o servidor do EcoTec está ligado.',
    );
  }

  return new ErroApi('desconhecido', 'Algo deu errado. Tente de novo.');
}

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const convertido = paraErroApi(erro);
    const url: string = erro?.config?.url ?? '';
    const ehLogin = url.includes('auth/login');
    if (convertido.status === 401 && tokenAtual && !ehLogin) {
      avisarSessaoExpirada?.();
    }
    return Promise.reject(convertido);
  },
);

/** Mensagem amigável para qualquer erro capturado nas telas. */
export function mensagemDeErro(erro: unknown): string {
  return paraErroApi(erro).message;
}
