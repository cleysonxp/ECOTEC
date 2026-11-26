import * as Location from 'expo-location';
import { apenasDigitos, Coordenadas, mascararCep } from './formatadores';

export type EnderecoDoPonto = {
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
};

const SIGLAS: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE',
  'distrito federal': 'DF', 'espirito santo': 'ES', goias: 'GO', maranhao: 'MA',
  'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG', para: 'PA',
  paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI', 'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};

/** "São Paulo" -> "SP". Siglas passam direto. */
export function siglaDoEstado(regiao?: string | null): string {
  const texto = (regiao ?? '').trim();
  if (/^[A-Za-z]{2}$/.test(texto)) return texto.toUpperCase();
  const chave = texto
    .replace(/^state of\s+/i, '')
    .replace(/^estado de\s+/i, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return SIGLAS[chave] ?? texto;
}

/** Converte coordenadas em endereço (geocodificação reversa do próprio sistema do aparelho). */
export async function enderecoDoPonto(ponto: Coordenadas): Promise<EnderecoDoPonto | null> {
  try {
    const [achado] = await Location.reverseGeocodeAsync(ponto);
    if (!achado) return null;
    const cep = apenasDigitos(achado.postalCode ?? '');
    return {
      cep: cep.length === 8 ? mascararCep(cep) : '',
      estado: siglaDoEstado(achado.region),
      cidade: achado.city ?? achado.subregion ?? '',
      bairro: achado.district ?? '',
      rua: achado.street ?? '',
      numero: apenasDigitos(achado.streetNumber ?? ''),
    };
  } catch {
    return null; // sem geocodificação (ex.: sem internet): o usuário preenche o endereço.
  }
}

/** Nome curto do lugar para o cabeçalho do feed: "Centro, Santana de Parnaíba". */
export async function lugarDoEndereco(ponto: Coordenadas): Promise<string | null> {
  const endereco = await enderecoDoPonto(ponto);
  if (!endereco) return null;
  const partes = [endereco.bairro, endereco.cidade].filter((p) => p.length > 0);
  if (partes.length === 0) return endereco.estado || null;
  return partes.join(', ');
}
