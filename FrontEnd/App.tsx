import {
  AtkinsonHyperlegibleNext_400Regular,
  AtkinsonHyperlegibleNext_500Medium,
  AtkinsonHyperlegibleNext_600SemiBold,
  AtkinsonHyperlegibleNext_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible-next';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { focusManager, onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { iniciarConfiguracaoDaApi } from './src/api/configuracao';
import { FaixaSemConexao } from './src/components/FaixaSemConexao';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AvisosProvider } from './src/contexts/AvisosContext';
import { CurtidasProvider } from './src/contexts/CurtidasContext';
import { LocalizacaoProvider } from './src/contexts/LocalizacaoContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { cores, definirFontesDisponiveis } from './src/theme';

// Mantém a tela de abertura até as fontes e a sessão estarem prontas.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30 * 1000 },
    mutations: { retry: 0 },
  },
});

// O React Query pausa as buscas sem rede e as refaz quando o app volta ao primeiro plano.
onlineManager.setEventListener((definirOnline) =>
  NetInfo.addEventListener((estado) => definirOnline(estado.isConnected !== false)),
);
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => focusManager.setFocused(estado === 'active'));
}

const temaDeNavegacao = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.folha,
    background: cores.nevoa,
    card: cores.branco,
    text: cores.tinta,
    border: cores.linha,
  },
};

function Conteudo({ aoFicarPronto }: { aoFicarPronto: () => void }) {
  const { carregando, usuario } = useAuth();

  useEffect(() => {
    if (!carregando) aoFicarPronto();
  }, [carregando, aoFicarPronto]);

  if (carregando) return null;

  return (
    <NavigationContainer theme={temaDeNavegacao}>
      <AvisosProvider>
        <LocalizacaoProvider ativo={!!usuario}>
          <CurtidasProvider>
            <RootNavigator />
          </CurtidasProvider>
        </LocalizacaoProvider>
        <FaixaSemConexao />
      </AvisosProvider>
    </NavigationContainer>
  );
}

const esconderAbertura = () => {
  SplashScreen.hideAsync().catch(() => undefined);
};

export default function App() {
  const [fontesCarregadas, erroNasFontes] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    AtkinsonHyperlegibleNext_400Regular,
    AtkinsonHyperlegibleNext_500Medium,
    AtkinsonHyperlegibleNext_600SemiBold,
    AtkinsonHyperlegibleNext_700Bold,
    ...MaterialCommunityIcons.font,
  });
  const [apiConfigurada, setApiConfigurada] = useState(false);

  useEffect(() => {
    iniciarConfiguracaoDaApi().finally(() => setApiConfigurada(true));
  }, []);

  // Se as fontes não carregarem, o app segue com a fonte do sistema.
  if (erroNasFontes) definirFontesDisponiveis(false);

  if (!(fontesCarregadas || erroNasFontes) || !apiConfigurada) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Conteudo aoFicarPronto={esconderAbertura} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
