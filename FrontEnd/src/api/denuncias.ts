import { api, TEMPO_LIMITE_ENVIO } from './cliente';
import type {
  DenunciaCriadaResponse,
  DenunciaDetalheApi,
  DenunciaProximaApi,
  DenunciaRequest,
  MinhaDenunciaApi,
} from './tipos';

export type BuscaPorLocalizacao = {
  latitude: number;
  longitude: number;
  /** O back-end aceita de 0 (exclusivo) a 100 km. */
  raioKm: number;
};

/** GET /denuncia?latitude&longitude&raioKm - denúncias dentro do raio, da mais recente para a mais antiga. */
export async function listarDenunciasProximas(busca: BuscaPorLocalizacao): Promise<DenunciaProximaApi[]> {
  const { data } = await api.get<DenunciaProximaApi[]>('/denuncia', {
    params: {
      latitude: busca.latitude,
      longitude: busca.longitude,
      raioKm: busca.raioKm,
    },
    // O feed traz as imagens junto: dá um pouco mais de tempo em redes lentas.
    timeout: 30000,
  });
  return Array.isArray(data) ? data : [];
}

/** GET /denuncia/{id} */
export async function buscarDenuncia(id: number): Promise<DenunciaDetalheApi> {
  const { data } = await api.get<DenunciaDetalheApi>(`/denuncia/${id}`, { timeout: 30000 });
  return data;
}

/** GET /denuncia/minhasDenuncias - histórico do usuário autenticado. */
export async function listarMinhasDenuncias(): Promise<MinhaDenunciaApi[]> {
  const { data } = await api.get<MinhaDenunciaApi[]>('/denuncia/minhasDenuncias', { timeout: 30000 });
  return Array.isArray(data) ? data : [];
}

/** POST /denuncia - registra a denúncia. `aoProgredir` recebe de 0 a 1 durante o envio. */
export async function criarDenuncia(
  dados: DenunciaRequest,
  aoProgredir?: (fracao: number) => void,
): Promise<DenunciaCriadaResponse> {
  const { data } = await api.post<DenunciaCriadaResponse>('/denuncia', dados, {
    timeout: TEMPO_LIMITE_ENVIO,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    onUploadProgress: (evento) => {
      if (aoProgredir && evento.total) {
        aoProgredir(Math.min(1, evento.loaded / evento.total));
      }
    },
  });
  return data;
}

/** POST /denuncia/{id}/like */
export async function curtirDenuncia(id: number): Promise<void> {
  await api.post(`/denuncia/${id}/like`);
}

/** DELETE /denuncia/{id}/like */
export async function removerCurtida(id: number): Promise<void> {
  await api.delete(`/denuncia/${id}/like`);
}
