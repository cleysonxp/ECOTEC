import { useQuery } from '@tanstack/react-query';
import { buscarDenuncia, listarDenunciasProximas, listarMinhasDenuncias } from '../api/denuncias';
import { buscarEndereco } from '../api/enderecos';
import { paraDenuncia, paraDenunciaCompleta } from '../utils/denuncia';
import { Coordenadas } from '../utils/formatadores';

/** Chaves do cache. Tudo que é denúncia começa com 'denuncias' para ser atualizado em conjunto. */
export const chaves = {
  denuncias: ['denuncias'] as const,
  proximas: (latitude: number, longitude: number, raioKm: number) =>
    ['denuncias', 'proximas', latitude, longitude, raioKm] as const,
  minhas: ['denuncias', 'minhas'] as const,
  detalhe: (id: number) => ['denuncias', 'detalhe', id] as const,
  endereco: (idUsuario: number) => ['endereco', idUsuario] as const,
};

/** Arredonda para ~100 m: pequenas variações do GPS não disparam novas buscas. */
const arredondar = (valor: number) => Math.round(valor * 1000) / 1000;

/** Feed por localização (RF03): GET /denuncia?latitude&longitude&raioKm */
export function useDenunciasProximas(coordenadas: Coordenadas | null, raioKm: number) {
  const latitude = coordenadas ? arredondar(coordenadas.latitude) : 0;
  const longitude = coordenadas ? arredondar(coordenadas.longitude) : 0;
  return useQuery({
    queryKey: chaves.proximas(latitude, longitude, raioKm),
    enabled: !!coordenadas,
    queryFn: async () => {
      const lista = await listarDenunciasProximas({ latitude, longitude, raioKm });
      return lista.map(paraDenuncia);
    },
  });
}

/** Histórico do usuário (RF10): GET /denuncia/minhasDenuncias */
export function useMinhasDenuncias() {
  return useQuery({
    queryKey: chaves.minhas,
    queryFn: async () => (await listarMinhasDenuncias()).map(paraDenuncia),
  });
}

/** Denúncia completa (RF11): GET /denuncia/{id} */
export function useDenuncia(id: number) {
  return useQuery({
    queryKey: chaves.detalhe(id),
    queryFn: async () => paraDenunciaCompleta(await buscarDenuncia(id)),
  });
}

/** Endereço do usuário: GET /endereco/{idUsuario} (null quando ainda não foi cadastrado). */
export function useEnderecoDoUsuario(idUsuario: number) {
  return useQuery({
    queryKey: chaves.endereco(idUsuario),
    queryFn: () => buscarEndereco(idUsuario),
  });
}
