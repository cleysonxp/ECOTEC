import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { urlDaApi } from '../../api/cliente';
import { ResultadoDoTeste, salvarUrlDaApi, testarConexao, urlPadraoDaApi } from '../../api/configuracao';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Campo } from '../../components/Campo';
import { Texto } from '../../components/Texto';
import { useAvisos } from '../../contexts/AvisosContext';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco } from '../../theme';

/**
 * Conexão com o servidor (tela de apoio aos testes).
 * Mostra o endereço da API em uso, testa se o back-end responde e permite trocar o endereço
 * sem editar o código - útil quando o IP do computador muda de uma rede Wi-Fi para outra.
 */
export function ConexaoScreen({ navigation }: TelaProps<'Conexao'>) {
  const insets = useSafeAreaInsets();
  const { avisar } = useAvisos();
  const [url, setUrl] = useState(urlDaApi());
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDoTeste | null>(null);
  const padrao = urlPadraoDaApi();

  const testar = async () => {
    setTestando(true);
    setResultado(null);
    setResultado(await testarConexao(url));
    setTestando(false);
  };

  const salvar = async (novo: string | null) => {
    const final = await salvarUrlDaApi(novo);
    setUrl(final);
    setResultado(null);
    avisar(novo ? 'Endereço do servidor salvo.' : 'Endereço padrão restaurado.', 'sucesso');
  };

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde titulo="Conexão com o servidor" aoVoltar={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Texto variante="corpo" cor={cores.tintaSuave} style={{ marginBottom: espaco.lg }}>
            O app conversa com a API do EcoTec neste endereço. O celular e o computador que roda o back-end precisam
            estar no mesmo Wi-Fi.
          </Texto>

          <Campo
            rotulo="Endereço da API"
            icone="server-network"
            placeholder="http://192.168.0.10:5260"
            value={url}
            onChangeText={(texto) => {
              setUrl(texto);
              setResultado(null);
            }}
            ajuda={`Padrão detectado: ${padrao}`}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
          />

          {resultado ? (
            <Aviso
              tipo={resultado.ok ? 'sucesso' : 'erro'}
              titulo={resultado.ok ? 'Conexão funcionando' : 'Sem resposta do servidor'}
              style={{ marginBottom: espaco.md }}
            >
              {resultado.detalhe}
            </Aviso>
          ) : null}

          <Botao titulo="Testar conexão" icone="reload" variante="secundario" onPress={testar} carregando={testando} />
          <Botao titulo="Salvar endereço" onPress={() => void salvar(url)} style={{ marginTop: espaco.sm }} />
          <Botao
            titulo="Usar o endereço padrão"
            variante="suave"
            onPress={() => void salvar(null)}
            style={{ marginTop: espaco.sm }}
          />

          <Aviso tipo="info" titulo="Como o endereço padrão é escolhido" style={{ marginTop: espaco.xl }}>
            O app usa o IP do computador que está rodando o Expo, na porta 5260 (a porta do back-end). Para fixar outro
            endereço, defina EXPO_PUBLIC_API_URL no arquivo .env ou salve o endereço nesta tela.
          </Aviso>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  conteudo: {
    padding: espaco.xl,
  },
});
