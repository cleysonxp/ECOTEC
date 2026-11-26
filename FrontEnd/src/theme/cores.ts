/**
 * Paleta do EcoTec: verde e branco.
 * Os nomes vêm do próprio tema do app (mata, folha, broto...) para facilitar a leitura do código.
 */
export const cores = {
  // Verdes
  mata: '#0B3B2C', // verde mais profundo: cabeçalhos e títulos
  mataClara: '#14523F', // curvas de nível sobre o verde-mata
  folha: '#0F6B45', // ação principal (contraste 6,5:1 com branco)
  folhaPressionada: '#0B5637',
  broto: '#2FBF74', // destaque sobre fundo escuro
  menta: '#BFF0D2',
  orvalho: '#EAF5EE', // superfícies suaves
  nevoa: '#F5F9F6', // fundo das telas

  // Neutros
  branco: '#FFFFFF',
  tinta: '#12261E', // texto principal
  tintaSuave: '#4A5F56', // texto secundário (6,8:1 em branco)
  tintaFraca: '#64766E', // placeholders e textos de apoio
  linha: '#D9E5DE', // bordas e divisórias

  // Estados
  erro: '#B3261E',
  erroFundo: '#FCEDEB',
  alerta: '#7A4F00',
  alertaFundo: '#FFF1CC',
  info: '#2B4C7E',
  infoFundo: '#E7EEF8',

  sombra: '#0B3B2C',
  veu: 'rgba(11, 59, 44, 0.55)', // fundo de modais
} as const;

export type Cor = keyof typeof cores;
