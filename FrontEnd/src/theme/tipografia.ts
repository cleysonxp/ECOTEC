import { TextStyle } from 'react-native';

/**
 * Tipografia do EcoTec.
 * - Sora: títulos e a marca (geométrica, com cara de tecnologia).
 * - Atkinson Hyperlegible Next: textos e formulários. Foi criada pelo Braille Institute
 *   para ser lida com facilidade por pessoas com baixa visão (RNF04 - acessibilidade).
 */
export const familias = {
  tituloForte: 'Sora_700Bold',
  titulo: 'Sora_600SemiBold',
  texto: 'AtkinsonHyperlegibleNext_400Regular',
  textoMedio: 'AtkinsonHyperlegibleNext_500Medium',
  textoForte: 'AtkinsonHyperlegibleNext_600SemiBold',
  textoNegrito: 'AtkinsonHyperlegibleNext_700Bold',
} as const;

export type Familia = keyof typeof familias;

const pesosDeReserva: Record<Familia, TextStyle['fontWeight']> = {
  tituloForte: '700',
  titulo: '600',
  texto: '400',
  textoMedio: '500',
  textoForte: '600',
  textoNegrito: '700',
};

let fontesDoAppDisponiveis = true;

/** Chamado pelo App quando as fontes não puderam ser carregadas: o app passa a usar a fonte do sistema. */
export function definirFontesDisponiveis(disponiveis: boolean) {
  fontesDoAppDisponiveis = disponiveis;
}

/** Estilo de fonte para uma família do app, com reserva para a fonte do sistema. */
export function estiloDaFonte(familia: Familia): TextStyle {
  return fontesDoAppDisponiveis
    ? { fontFamily: familias[familia] }
    : { fontWeight: pesosDeReserva[familia] };
}

type Definicao = { familia: Familia; fontSize: number; lineHeight: number; letterSpacing?: number };

export const variantesDeTexto = {
  destaque: { familia: 'tituloForte', fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  titulo: { familia: 'tituloForte', fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  subtitulo: { familia: 'titulo', fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  corpo: { familia: 'texto', fontSize: 16, lineHeight: 23 },
  corpoForte: { familia: 'textoForte', fontSize: 16, lineHeight: 23 },
  apoio: { familia: 'texto', fontSize: 14, lineHeight: 20 },
  apoioForte: { familia: 'textoForte', fontSize: 14, lineHeight: 20 },
  legenda: { familia: 'textoMedio', fontSize: 12.5, lineHeight: 17 },
  botao: { familia: 'textoNegrito', fontSize: 16.5, lineHeight: 22 },
} satisfies Record<string, Definicao>;

export type VarianteTexto = keyof typeof variantesDeTexto;
