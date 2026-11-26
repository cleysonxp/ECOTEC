import { useNetInfo } from '@react-native-community/netinfo';

/** Indica se o aparelho está conectado a alguma rede (RNF10). */
export function useConexao(): { conectado: boolean } {
  const estado = useNetInfo();
  // isConnected começa como null (ainda não verificado): só consideramos offline quando for false.
  return { conectado: estado.isConnected !== false };
}
