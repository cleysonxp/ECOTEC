import { api, ErroApi } from './cliente';
import type { EnderecoRequest, EnderecoResponse } from './tipos';

/** GET /endereco/{idUsuario} - devolve null quando o usuário ainda não cadastrou endereço (404). */
export async function buscarEndereco(idUsuario: number): Promise<EnderecoResponse | null> {
  try {
    const { data } = await api.get<EnderecoResponse>(`/endereco/${idUsuario}`);
    return data;
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

/** POST /endereco - cada usuário tem um único endereço. */
export async function criarEndereco(dados: EnderecoRequest): Promise<void> {
  await api.post('/endereco', {
    cep: dados.cep.trim(),
    estado: dados.estado.trim().toUpperCase(),
    cidade: dados.cidade.trim(),
    bairro: dados.bairro.trim(),
    rua: dados.rua.trim(),
    idUsuario: dados.idUsuario,
  });
}
