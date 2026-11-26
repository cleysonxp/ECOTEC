import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mensagemDeErro } from '../../api/cliente';
import { criarEndereco } from '../../api/enderecos';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { CamposDeEndereco, Endereco, ENDERECO_VAZIO, ErrosDeEndereco, temErro, validarEndereco } from '../../components/CamposDeEndereco';
import { CurvasDeNivel } from '../../components/CurvasDeNivel';
import { FolhaDeAcoes } from '../../components/FolhaDeAcoes';
import { Icone, NomeIcone } from '../../components/Icone';
import { Texto } from '../../components/Texto';
import { useAuth, useUsuario } from '../../contexts/AuthContext';
import { useAvisos } from '../../contexts/AvisosContext';
import { chaves, useEnderecoDoUsuario, useMinhasDenuncias } from '../../hooks/useDenuncias';
import { cores, espaco, raio } from '../../theme';
import { iniciais, mascararCep } from '../../utils/formatadores';

/** Perfil: dados da conta, endereço, resumo da participação, privacidade e saída. */
export function PerfilScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const usuario = useUsuario();
  const { sair } = useAuth();
  const minhas = useMinhasDenuncias();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const denuncias = minhas.data ?? [];
  const resolvidas = denuncias.filter((d) => d.status.etapa === 2).length;
  const curtidas = denuncias.reduce((soma, d) => soma + d.curtidas, 0);
  const valor = (n: number) => (minhas.isSuccess ? String(n) : '–');

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: espaco.xxl }} keyboardShouldPersistTaps="handled">
          <View style={[estilos.cabecalho, { paddingTop: insets.top + espaco.lg }]}>
            <CurvasDeNivel />
            <View style={estilos.avatar} accessibilityElementsHidden importantForAccessibility="no">
              <Texto variante="titulo" cor={cores.mata} maxFontSizeMultiplier={1}>
                {iniciais(usuario.nome)}
              </Texto>
            </View>
            <View style={{ flex: 1 }}>
              <Texto variante="titulo" cor={cores.branco} accessibilityRole="header" numberOfLines={2}>
                {usuario.nome}
              </Texto>
              <Texto variante="apoio" cor={cores.menta} numberOfLines={1}>
                {usuario.email}
              </Texto>
            </View>
          </View>

          <View style={estilos.conteudo}>
            <View style={estilos.resumo}>
              <Numero valor={valor(denuncias.length)} rotulo="Denúncias registradas" />
              <View style={estilos.divisor} />
              <Numero valor={valor(resolvidas)} rotulo="Já resolvidas" />
              <View style={estilos.divisor} />
              <Numero valor={valor(curtidas)} rotulo="Curtidas recebidas" />
            </View>

            <Texto variante="subtitulo" accessibilityRole="header" style={estilos.tituloSecao}>
              Meu endereço
            </Texto>
            <EnderecoDoUsuario idUsuario={usuario.idUsuario} />

            <Texto variante="subtitulo" accessibilityRole="header" style={estilos.tituloSecao}>
              Sobre o app
            </Texto>
            <View style={estilos.cartao}>
              <ItemDeMenu
                icone="shield-lock-outline"
                titulo="Privacidade e dados"
                descricao="O que o EcoTec coleta e para quê"
                onPress={() => navigation.navigate('Privacidade')}
              />
              {__DEV__ ? (
                <>
                  <View style={estilos.linha} />
                  <ItemDeMenu
                    icone="server-network"
                    titulo="Conexão com o servidor"
                    descricao="Endereço da API usada pelo app"
                    onPress={() => navigation.navigate('Conexao')}
                  />
                </>
              ) : null}
            </View>

            <Botao
              titulo="Sair da conta"
              icone="logout"
              variante="perigo"
              onPress={() => setConfirmandoSaida(true)}
              style={{ marginTop: espaco.xl }}
              testID="perfil-sair"
            />

            <Texto variante="legenda" cor={cores.tintaFraca} centro style={{ marginTop: espaco.lg }}>
              EcoTec {Constants.expoConfig?.version ?? '1.0.0'}
              {'\n'}Trabalho de conclusão de curso de Sistemas de Informação, UNIP
            </Texto>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FolhaDeAcoes
        visivel={confirmandoSaida}
        titulo="Sair da conta?"
        texto="Você precisará informar e-mail e senha para entrar de novo."
        aoFechar={() => setConfirmandoSaida(false)}
        acoes={[{ titulo: 'Sair da conta', icone: 'logout', perigo: true, onPress: () => void sair() }]}
      />
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Texto variante="titulo" cor={cores.mata}>
        {valor}
      </Texto>
      <Texto variante="legenda" cor={cores.tintaSuave} centro>
        {rotulo}
      </Texto>
    </View>
  );
}

function ItemDeMenu({ icone, titulo, descricao, onPress }: { icone: NomeIcone; titulo: string; descricao: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={descricao}
      style={({ pressed }) => [estilos.itemDeMenu, pressed && { backgroundColor: cores.orvalho }]}
    >
      <View style={estilos.iconeDeMenu}>
        <Icone nome={icone} tamanho={22} cor={cores.folha} />
      </View>
      <View style={{ flex: 1 }}>
        <Texto variante="corpoForte">{titulo}</Texto>
        <Texto variante="apoio" cor={cores.tintaSuave}>
          {descricao}
        </Texto>
      </View>
      <Icone nome="chevron-right" tamanho={22} cor={cores.tintaFraca} />
    </Pressable>
  );
}

/** Mostra o endereço do usuário (GET /endereco/{id}) ou o formulário para cadastrá-lo (POST /endereco). */
function EnderecoDoUsuario({ idUsuario }: { idUsuario: number }) {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();
  const consulta = useEnderecoDoUsuario(idUsuario);
  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [erros, setErros] = useState<ErrosDeEndereco>({});
  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  const limparErro = useCallback(
    (campo: keyof Endereco) => setErros((e) => (e[campo] ? { ...e, [campo]: null } : e)),
    [],
  );

  const salvar = async () => {
    const novosErros = validarEndereco(endereco);
    setErros(novosErros);
    setFalha(null);
    if (temErro(novosErros)) return;
    setSalvando(true);
    try {
      await criarEndereco({ ...endereco, idUsuario });
      await queryClient.invalidateQueries({ queryKey: chaves.endereco(idUsuario) });
      avisar('Endereço salvo.', 'sucesso');
    } catch (erro) {
      setFalha(mensagemDeErro(erro));
    } finally {
      setSalvando(false);
    }
  };

  if (consulta.isPending) {
    return (
      <View style={[estilos.cartao, estilos.carregando]}>
        <ActivityIndicator color={cores.folha} />
        <Texto variante="apoio" cor={cores.tintaSuave}>
          Carregando endereço…
        </Texto>
      </View>
    );
  }

  if (consulta.isError) {
    return (
      <Aviso
        tipo="erro"
        acao={<Botao titulo="Tentar de novo" variante="perigo" compacto onPress={() => void consulta.refetch()} />}
      >
        {mensagemDeErro(consulta.error)}
      </Aviso>
    );
  }

  const salvo = consulta.data;
  if (salvo) {
    return (
      <View style={[estilos.cartao, estilos.endereco]}>
        <View style={estilos.iconeDeMenu}>
          <Icone nome="map-marker-outline" tamanho={22} cor={cores.folha} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto variante="corpoForte">{salvo.rua}</Texto>
          <Texto variante="apoio" cor={cores.tintaSuave}>
            {salvo.bairro}, {salvo.cidade}/{salvo.estado}
          </Texto>
          <Texto variante="apoio" cor={cores.tintaSuave}>
            CEP {mascararCep(salvo.cep)}
          </Texto>
        </View>
      </View>
    );
  }

  return (
    <View style={[estilos.cartao, { padding: espaco.md }]}>
      <Aviso tipo="alerta" titulo="Endereço ainda não cadastrado" style={{ marginBottom: espaco.md }}>
        Informe seu endereço para concluir o cadastro.
      </Aviso>
      <CamposDeEndereco valor={endereco} aoMudar={setEndereco} erros={erros} aoLimparErro={limparErro} />
      {falha ? (
        <Aviso tipo="erro" style={{ marginBottom: espaco.md }}>
          {falha}
        </Aviso>
      ) : null}
      <Botao titulo="Salvar endereço" onPress={salvar} carregando={salvando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.nevoa,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.mata,
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.xxl + espaco.sm,
    overflow: 'hidden',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cores.menta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    paddingHorizontal: espaco.md,
    marginTop: -espaco.xl,
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.xs,
  },
  divisor: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: cores.linha,
  },
  tituloSecao: {
    marginTop: espaco.xl,
    marginBottom: espaco.sm,
    marginLeft: espaco.xxs,
  },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    overflow: 'hidden',
  },
  carregando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.md,
  },
  endereco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.md,
  },
  itemDeMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: 68,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
  },
  iconeDeMenu: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linha: {
    height: 1,
    backgroundColor: cores.linha,
    marginLeft: espaco.md + 44 + espaco.sm,
  },
});
