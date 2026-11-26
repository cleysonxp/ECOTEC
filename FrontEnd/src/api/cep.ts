import axios from 'axios';

export type EnderecoPorCep = {
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
};

/**
 * Consulta o CEP no serviço público ViaCEP para preencher o endereço automaticamente.
 * É uma chamada separada da API do EcoTec (sem token). Se falhar, o usuário digita o endereço.
 */
export async function consultarCep(cep: string): Promise<EnderecoPorCep | null> {
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) return null;
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${digitos}/json/`, { timeout: 6000 });
    if (!data || data.erro) return null;
    return {
      estado: String(data.uf ?? ''),
      cidade: String(data.localidade ?? ''),
      bairro: String(data.bairro ?? ''),
      rua: String(data.logradouro ?? ''),
    };
  } catch {
    return null;
  }
}
