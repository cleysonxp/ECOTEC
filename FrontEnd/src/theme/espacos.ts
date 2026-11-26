/** Escala de espaçamento (múltiplos de 4) e raios usados em todo o app. */
export const espaco = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pilula: 999,
} as const;

/** Altura mínima de toque recomendada pelas diretrizes de acessibilidade (44 pt no iOS, 48 dp no Android). */
export const ALVO_DE_TOQUE = 48;
