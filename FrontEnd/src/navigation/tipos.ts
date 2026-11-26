import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AbasParamList = {
  Inicio: undefined;
  Mapa: undefined;
  Historico: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  // Sem sessão
  Login: undefined;
  Cadastro: undefined;
  RecuperarSenha: { email?: string } | undefined;
  // Com sessão
  Abas: NavigatorScreenParams<AbasParamList> | undefined;
  DetalheDenuncia: { id: number };
  NovaDenuncia: undefined;
  // Sempre disponíveis
  Privacidade: undefined;
  Conexao: undefined;
};

export type TelaProps<Tela extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Tela>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
