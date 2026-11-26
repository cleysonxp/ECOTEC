import { apenasDigitos } from './formatadores';

/** Cada função devolve a mensagem de erro, ou null quando o valor é válido. */

export const LIMITES = {
  nome: 100, // varchar(100) no banco
  email: 100,
  senhaMin: 8,
  senhaMax: 64,
  endereco: 100,
  titulo: 80,
  descricaoMin: 10,
  descricao: 3800, // título + descrição cabem no varchar(4000) do back-end
  pontoReferencia: 200,
} as const;

export function validarNome(nome: string): string | null {
  const limpo = nome.trim();
  if (limpo.length === 0) return 'Informe seu nome.';
  if (limpo.length < 3) return 'O nome precisa ter pelo menos 3 letras.';
  return null;
}

export function validarEmail(email: string): string | null {
  const limpo = email.trim();
  if (limpo.length === 0) return 'Informe seu e-mail.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo)) return 'Digite um e-mail válido, como nome@exemplo.com.';
  return null;
}

export function validarSenha(senha: string): string | null {
  if (senha.length === 0) return 'Informe sua senha.';
  if (senha.length < LIMITES.senhaMin) return `A senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`;
  return null;
}

export function validarConfirmacao(senha: string, confirmacao: string): string | null {
  if (confirmacao.length === 0) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return null;
}

export function validarCep(cep: string): string | null {
  const d = apenasDigitos(cep);
  if (d.length === 0) return 'Informe o CEP.';
  if (d.length !== 8) return 'O CEP tem 8 números.';
  return null;
}

export function validarUf(uf: string): string | null {
  const limpo = uf.trim();
  if (limpo.length === 0) return 'Informe o estado.';
  if (!/^[A-Za-z]{2}$/.test(limpo)) return 'Use a sigla, como SP.';
  return null;
}

export function validarObrigatorio(valor: string, mensagem: string): string | null {
  return valor.trim().length === 0 ? mensagem : null;
}
