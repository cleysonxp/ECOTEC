import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { configurarUrlDaApi } from './cliente';

/**
 * Endereço da API.
 *
 * Ordem de escolha:
 * 1. Endereço salvo pelo usuário na tela "Conexão com o servidor".
 * 2. Variável EXPO_PUBLIC_API_URL do arquivo .env.
 * 3. Detecção automática: o mesmo computador que está rodando o Expo (`npx expo start`),
 *    na porta 5260 - a porta padrão do back-end (launchSettings.json).
 */

export const PORTA_DA_API = 5260;
const CHAVE = 'ecotec.urlDaApi';

function limpar(url: string): string {
  const texto = url.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(texto) ? texto : `http://${texto}`;
}

/** Endereço padrão, sem considerar o que foi salvo no aparelho. */
export function urlPadraoDaApi(): string {
  const doAmbiente = process.env.EXPO_PUBLIC_API_URL;
  if (doAmbiente && doAmbiente.trim().length > 0) return limpar(doAmbiente);

  // No Expo Go, hostUri é "IP-do-computador:8081".
  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ?? (Constants as any).expoGoConfig?.debuggerHost ?? undefined;
  const host = hostUri?.split(':')[0];
  const ehIpOuLocal = !!host && (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host === 'localhost');
  return `http://${ehIpOuLocal ? host : 'localhost'}:${PORTA_DA_API}`;
}

/** Lê o endereço salvo (ou o padrão) e configura o cliente HTTP. Chamado na abertura do app. */
export async function iniciarConfiguracaoDaApi(): Promise<string> {
  let url = urlPadraoDaApi();
  try {
    const salva = await AsyncStorage.getItem(CHAVE);
    if (salva) url = limpar(salva);
  } catch {
    // Sem acesso ao armazenamento: segue com o endereço padrão.
  }
  configurarUrlDaApi(url);
  return url;
}

/** Salva um novo endereço. Passe null para voltar ao padrão. */
export async function salvarUrlDaApi(url: string | null): Promise<string> {
  const final = url && url.trim().length > 0 ? limpar(url) : urlPadraoDaApi();
  if (url && url.trim().length > 0) {
    await AsyncStorage.setItem(CHAVE, final);
  } else {
    await AsyncStorage.removeItem(CHAVE);
  }
  configurarUrlDaApi(final);
  return final;
}

export type ResultadoDoTeste = { ok: boolean; detalhe: string };

/** Verifica se há um servidor do EcoTec respondendo no endereço informado. */
export async function testarConexao(url: string): Promise<ResultadoDoTeste> {
  const base = limpar(url);
  try {
    // O back-end publica o Swagger; qualquer resposta HTTP já prova que o servidor está no ar.
    const resposta = await axios.get(`${base}/swagger/v1/swagger.json`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    const titulo: string | undefined = resposta.data?.info?.title;
    return {
      ok: true,
      detalhe: titulo ? `Servidor encontrado (${titulo}).` : `Servidor encontrado (HTTP ${resposta.status}).`,
    };
  } catch {
    return {
      ok: false,
      detalhe:
        'Nenhum servidor respondeu nesse endereço. Confira o IP, a porta, se o back-end está rodando e se o celular está no mesmo Wi-Fi do computador.',
    };
  }
}
