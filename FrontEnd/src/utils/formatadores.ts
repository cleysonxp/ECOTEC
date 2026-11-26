/** Funções puras de formatação (datas, CEP, distância, endereço, nomes). */

const ISO = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Converte a data enviada pela API em Date.
 * O back-end grava a hora local do servidor sem fuso (ex.: "2026-11-14T11:45:10.123456"),
 * então, quando não há fuso no texto, a data é tratada como hora local do aparelho.
 */
export function interpretarData(valor?: string | null): Date | null {
  if (!valor) return null;
  const m = ISO.exec(valor.trim());
  if (!m) {
    const tentativa = new Date(valor);
    return Number.isNaN(tentativa.getTime()) ? null : tentativa;
  }
  const [, ano, mes, dia, hora, min, seg = '0', fracao = '0', fuso] = m;
  const ms = Math.round(Number(`0.${fracao}`) * 1000);
  if (!fuso) {
    return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min), Number(seg), ms);
  }
  const utc = Date.UTC(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min), Number(seg), ms);
  if (fuso === 'Z') return new Date(utc);
  const sinal = fuso.startsWith('-') ? -1 : 1;
  const digitos = fuso.replace(/[^0-9]/g, '');
  const deslocamento = (Number(digitos.slice(0, 2)) * 60 + Number(digitos.slice(2, 4))) * 60000;
  return new Date(utc - sinal * deslocamento);
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function formatarData(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

export function formatarHora(data: Date): string {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function formatarDataHora(data: Date | null): string {
  if (!data) return 'Data não informada';
  return `${formatarData(data)} às ${formatarHora(data)}`;
}

/** "agora", "há 12 min", "há 3 h", "ontem", "há 4 dias" ou a data, para registros antigos. */
export function tempoDecorrido(data: Date | null, agora: Date = new Date()): string {
  if (!data) return '';
  const minutos = Math.floor((agora.getTime() - data.getTime()) / 60000);
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return formatarData(data);
}

export const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

/** 06500000 -> 06500-000 */
export function mascararCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export type Coordenadas = { latitude: number; longitude: number };

/** Distância em km entre dois pontos (fórmula de Haversine, a mesma usada no back-end). */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const rad = (grau: number) => (grau * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatarDistancia(km: number): string {
  if (!Number.isFinite(km)) return '';
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

type PartesEndereco = {
  rua?: string | null;
  numero?: number | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

const preenchido = (valor?: string | null): valor is string => !!valor && valor.trim().length > 0;

/** "Rua das Flores, 120" (número 0 vira "s/n"). */
export function formatarLogradouro({ rua, numero }: PartesEndereco): string {
  if (!preenchido(rua)) return '';
  return `${rua.trim()}, ${numero && numero > 0 ? numero : 's/n'}`;
}

/** "Centro, Santana de Parnaíba/SP" - pula o que não foi informado. */
export function formatarRegiao({ bairro, cidade, estado }: PartesEndereco): string {
  const local = [bairro, cidade].filter(preenchido).map((p) => p.trim()).join(', ');
  if (!preenchido(estado)) return local;
  return local ? `${local}/${estado.trim()}` : estado.trim();
}

export function formatarEnderecoCompleto(partes: PartesEndereco): string {
  return [formatarLogradouro(partes), formatarRegiao(partes)].filter((p) => p.length > 0).join(' - ');
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}

/** "Vitor dos Santos Lima" -> "Vitor L." (como o nome aparece para outros usuários). */
export function nomePublico(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'Usuário';
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function formatarDuracao(ms: number): string {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${doisDigitos(total % 60)}`;
}

/** Plural simples: contar(2, 'denúncia', 'denúncias') -> "2 denúncias". */
export function contar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
