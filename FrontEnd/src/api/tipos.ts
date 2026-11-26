/**
 * Contratos da API do EcoTec (ASP.NET Core), exatamente como o back-end envia e recebe.
 * O ASP.NET serializa os nomes em camelCase e os campos byte[] como texto base64.
 */

// ---------- Autenticação e usuário ----------

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface UsuarioSessao {
  idUsuario: number;
  nome: string;
  email: string;
}

/** Resposta de POST /auth/login */
export interface LoginResponse {
  token: string;
  usuario: UsuarioSessao;
}

/** Corpo de POST /usuario */
export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
}

// ---------- Endereço do usuário ----------

/** Corpo de POST /endereco */
export interface EnderecoRequest {
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  idUsuario: number;
}

/** Resposta de GET /endereco/{idUsuario} */
export interface EnderecoResponse extends EnderecoRequest {
  idEndereco: number;
}

// ---------- Denúncias ----------

export interface EnderecoDenunciaRequest {
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  pontoReferencia: string;
  latitude: number;
  longitude: number;
}

/** Corpo de POST /denuncia */
export interface DenunciaRequest {
  descricao: string;
  /** Imagem em base64 (campo byte[] no back-end). */
  imagem: string | null;
  /** Vídeo em base64 (campo byte[] no back-end). */
  video: string | null;
  idTipoDenuncia: number;
  endereco: EnderecoDenunciaRequest;
}

/** Resposta de POST /denuncia (201) */
export interface DenunciaCriadaResponse {
  mensagem: string;
  id: number;
}

interface DenunciaBaseApi {
  id: number;
  descricao: string;
  dataHora: string;
  imagem: string | null;
  video: string | null;
  status: string | null;
  tipo: string;
  quantidadeLikes: number;
}

/** Item de GET /denuncia?latitude&longitude&raioKm */
export interface DenunciaProximaApi extends DenunciaBaseApi {
  usuario: { id: number; nome: string };
  endereco: {
    cidade: string;
    bairro: string;
    rua: string;
    numero: number;
    latitude: number;
    longitude: number;
  };
}

/** Resposta de GET /denuncia/{id} */
export interface DenunciaDetalheApi extends DenunciaBaseApi {
  usuario: { id: number; nome: string };
  endereco: {
    cep: string;
    estado: string;
    cidade: string;
    bairro: string;
    rua: string;
    numero: number;
    pontoReferencia: string;
    latitude: number;
    longitude: number;
  };
}

/** Item de GET /denuncia/minhasDenuncias */
export interface MinhaDenunciaApi extends DenunciaBaseApi {
  endereco: {
    cidade: string;
    bairro: string;
    rua: string;
    numero: number;
  };
}

export interface MensagemResponse {
  mensagem: string;
}
