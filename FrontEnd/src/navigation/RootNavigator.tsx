import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { BarraDeAbas } from '../components/BarraDeAbas';
import { useAuth } from '../contexts/AuthContext';
import { CadastroScreen } from '../screens/auth/CadastroScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RecuperarSenhaScreen } from '../screens/auth/RecuperarSenhaScreen';
import { NovaDenunciaScreen } from '../screens/denuncia/NovaDenunciaScreen';
import { DetalheDenunciaScreen } from '../screens/feed/DetalheDenunciaScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { MapaScreen } from '../screens/feed/MapaScreen';
import { MinhasDenunciasScreen } from '../screens/historico/MinhasDenunciasScreen';
import { ConexaoScreen } from '../screens/perfil/ConexaoScreen';
import { PerfilScreen } from '../screens/perfil/PerfilScreen';
import { PrivacidadeScreen } from '../screens/perfil/PrivacidadeScreen';
import { cores } from '../theme';
import { AbasParamList, RootStackParamList } from './tipos';

const Pilha = createNativeStackNavigator<RootStackParamList>();
const Abas = createBottomTabNavigator<AbasParamList>();

function AbasDoApp() {
  return (
    <Abas.Navigator tabBar={(props) => <BarraDeAbas {...props} />} screenOptions={{ headerShown: false }}>
      <Abas.Screen name="Inicio" component={FeedScreen} />
      <Abas.Screen name="Mapa" component={MapaScreen} />
      <Abas.Screen name="Historico" component={MinhasDenunciasScreen} />
      <Abas.Screen name="Perfil" component={PerfilScreen} />
    </Abas.Navigator>
  );
}

/**
 * Navegação principal.
 * As telas disponíveis dependem da sessão: sem usuário, só login/cadastro;
 * com usuário, as abas e as telas de denúncia. Assim as rotas protegidas nunca abrem sem token.
 */
export function RootNavigator() {
  const { usuario } = useAuth();

  return (
    <Pilha.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.nevoa } }}>
      {usuario ? (
        <Pilha.Group>
          <Pilha.Screen name="Abas" component={AbasDoApp} />
          <Pilha.Screen name="DetalheDenuncia" component={DetalheDenunciaScreen} />
          <Pilha.Screen
            name="NovaDenuncia"
            component={NovaDenunciaScreen}
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }}
          />
        </Pilha.Group>
      ) : (
        <Pilha.Group>
          <Pilha.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
          <Pilha.Screen name="Cadastro" component={CadastroScreen} />
          <Pilha.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
        </Pilha.Group>
      )}
      <Pilha.Screen name="Privacidade" component={PrivacidadeScreen} />
      <Pilha.Screen name="Conexao" component={ConexaoScreen} />
    </Pilha.Navigator>
  );
}
