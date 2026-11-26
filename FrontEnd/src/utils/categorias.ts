import type { NomeIcone } from '../components/Icone';

export type Categoria = {
  /** Mesmo ID da tabela TBL_TIPO_DENUNCIA do back-end. */
  id: number;
  /** Descrição exatamente como está cadastrada no back-end. */
  nome: string;
  /** Nome curto para cartões e filtros. */
  curto: string;
  icone: NomeIcone;
  explicacao: string;
};

/**
 * As sete categorias de denúncia do EcoTec.
 * O back-end não tem rota para listar os tipos, então a lista fica aqui,
 * com os mesmos IDs inseridos pela migration "SeedTipoDenuncia".
 */
export const CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nome: 'Desmatamento e queimadas',
    curto: 'Desmatamento e queimadas',
    icone: 'pine-tree-fire',
    explicacao: 'Corte ilegal de árvores, destruição de área verde e queimadas irregulares.',
  },
  {
    id: 2,
    nome: 'Poluição da água',
    curto: 'Poluição da água',
    icone: 'water-alert-outline',
    explicacao: 'Rios, córregos e lagos contaminados por lixo ou outras condutas irregulares.',
  },
  {
    id: 3,
    nome: 'Acúmulo e descarte irregular de lixo',
    curto: 'Descarte irregular de lixo',
    icone: 'trash-can-outline',
    explicacao: 'Resíduos descartados em ruas, terrenos e áreas públicas.',
  },
  {
    id: 4,
    nome: 'Crimes contra animais e vida selvagem',
    curto: 'Crimes contra animais',
    icone: 'paw-outline',
    explicacao: 'Maus-tratos a animais domésticos, agressão à fauna e caça ilegal.',
  },
  {
    id: 5,
    nome: 'Construções irregulares em áreas protegidas',
    curto: 'Construções irregulares',
    icone: 'home-alert-outline',
    explicacao: 'Obras clandestinas ou fora das normas em áreas protegidas.',
  },
  {
    id: 6,
    nome: 'Poluição do ar nas áreas urbanas',
    curto: 'Poluição do ar',
    icone: 'smog',
    explicacao: 'Emissão de gases tóxicos ou resíduos que contaminam o ar.',
  },
  {
    id: 7,
    nome: 'Outros',
    curto: 'Outros danos ambientais',
    icone: 'dots-horizontal-circle-outline',
    explicacao: 'Ocorrências que não se encaixam nas outras categorias.',
  },
];

export const CATEGORIA_OUTROS = CATEGORIAS[6];

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Encontra a categoria a partir da descrição devolvida pela API (campo `tipo`). */
export function categoriaPorDescricao(tipo?: string | null): Categoria {
  if (!tipo) return CATEGORIA_OUTROS;
  const alvo = normalizar(tipo);
  return CATEGORIAS.find((c) => normalizar(c.nome) === alvo) ?? CATEGORIA_OUTROS;
}

export function categoriaPorId(id: number): Categoria | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}
