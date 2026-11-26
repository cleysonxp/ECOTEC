import { api } from './cliente';
import type { LoginRequest, LoginResponse, UsuarioRequest } from './tipos';

/** POST /auth/login - valida as credenciais e devolve o token JWT (válido por 2 horas). */
export async function entrar(credenciais: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    email: credenciais.email.trim(),
    senha: credenciais.senha,
  });
  if (!data?.token || !data?.usuario) {
    throw new Error('Resposta de login inesperada.');
  }
  return data;
}

/** POST /usuario - cria a conta. O back-end guarda a senha com hash BCrypt e não devolve corpo. */
export async function criarUsuario(dados: UsuarioRequest): Promise<void> {
  await api.post('/usuario', {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    senha: dados.senha,
  });
}

/** Lançado quando o app pede algo que a API desta versão ainda não oferece. */
export class RecursoIndisponivel extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'RecursoIndisponivel';
  }
}

/**
 * Recuperação de senha por e-mail.
 * A API atual não tem rota para isso. Quando o back-end ganhar essa rota,
 * basta trocar o conteúdo desta função pela chamada (ex.: api.post('/auth/recuperar-senha', { email })).
 */
export async function solicitarRecuperacaoDeSenha(_email: string): Promise<void> {
  throw new RecursoIndisponivel(
    'O envio do e-mail de recuperação ainda não está disponível nesta versão do EcoTec.',
  );
}
