import type { NomeIcone } from '../components/Icone';
import { cores } from '../theme';

/** As três situações de uma denúncia, na ordem em que acontecem. */
export const ETAPAS_DO_STATUS = ['Recebida', 'Em análise', 'Resolvida'] as const;

export type InfoStatus = {
  rotulo: string;
  /** Posição em ETAPAS_DO_STATUS, ou null quando o texto do servidor não é reconhecido. */
  etapa: 0 | 1 | 2 | null;
  cor: string;
  fundo: string;
  icone: NomeIcone;
};

const VISUAL: Array<Pick<InfoStatus, 'cor' | 'fundo' | 'icone'>> = [
  { cor: cores.info, fundo: cores.infoFundo, icone: 'inbox-arrow-down-outline' },
  { cor: cores.alerta, fundo: cores.alertaFundo, icone: 'progress-clock' },
  { cor: cores.folha, fundo: cores.orvalho, icone: 'check-decagram' },
];

/** Interpreta o texto de status devolvido pela API (ex.: "Em análise"). */
export function interpretarStatus(texto?: string | null): InfoStatus {
  const limpo = (texto ?? '').trim();
  const base = limpo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

  let etapa: InfoStatus['etapa'] = null;
  if (!limpo || base.includes('receb')) etapa = 0;
  else if (base.includes('analis')) etapa = 1;
  else if (base.includes('resolv') || base.includes('conclu')) etapa = 2;

  if (etapa === null) {
    return { rotulo: limpo, etapa, cor: cores.tintaSuave, fundo: cores.nevoa, icone: 'information-outline' };
  }
  return { rotulo: ETAPAS_DO_STATUS[etapa], etapa, ...VISUAL[etapa] };
}
