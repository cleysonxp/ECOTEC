import React, { ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paraErroApi } from '../../api/cliente';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Campo } from '../../components/Campo';
import { CamposDeEndereco, Endereco, ENDERECO_VAZIO, ErrosDeEndereco, temErro, validarEndereco } from '../../components/CamposDeEndereco';
import { CaixaDeSelecao } from '../../components/Selecao';
import { Texto } from '../../components/Texto';
import { useAuth } from '../../contexts/AuthContext';
import { useAvisos } from '../../contexts/AvisosContext';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco } from '../../theme';
import { LIMITES, validarConfirmacao, validarEmail, validarNome, validarSenha } from '../../utils/validacao';

type ErrosDaConta = { nome?: string | null; email?: string | null; senha?: string | null; confirmacao?: string | null; aceite?: string | null };

/**
 * Cadastro em duas etapas (RF01):
 *  1. dados de acesso - nome, e-mail, senha e aceite do tratamento de dados (LGPD);
 *  2. endereço - CEP, rua, bairro, cidade e estado.
 * Ao concluir, o app cria o usuário, entra e grava o endereço (POST /usuario, /auth/login e /endereco).
 */
export function CadastroScreen({ navigation }: TelaProps<'Cadastro'>) {
  const insets = useSafeAreaInsets();
  const { criarConta } = useAuth();
  const { avisar } = useAvisos();
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
  const campoEmail = useRef<ComponentRef<typeof TextInput>>(null);
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);
  const campoConfirmacao = useRef<ComponentRef<typeof TextInput>>(null);

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceite, setAceite] = useState(false);
  const [errosDaConta, setErrosDaConta] = useState<ErrosDaConta>({});

  const [endereco, setEndereco] = useState<Endereco>(ENDERECO_VAZIO);
  const [errosDoEndereco, setErrosDoEndereco] = useState<ErrosDeEndereco>({});

  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  const irParaEtapa = useCallback((nova: 1 | 2) => {
    setEtapa(nova);
    setFalha(null);
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // Na etapa 2, "voltar" retorna à etapa 1 em vez de sair do cadastro:
  // o gesto de voltar do iOS fica desligado e a tecla voltar do Android é tratada aqui.
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: etapa === 1 });
    if (etapa !== 2) return;
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      irParaEtapa(1);
      return true;
    });
    return () => assinatura.remove();
  }, [etapa, navigation, irParaEtapa]);

  const limparErroDaConta = (campo: keyof ErrosDaConta) =>
    setErrosDaConta((e) => (e[campo] ? { ...e, [campo]: null } : e));

  const limparErroDoEndereco = useCallback(
    (campo: keyof Endereco) => setErrosDoEndereco((e) => (e[campo] ? { ...e, [campo]: null } : e)),
    [],
  );

  const aoContinuar = () => {
    const erros: ErrosDaConta = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenha(senha),
      confirmacao: validarConfirmacao(senha, confirmacao),
      aceite: aceite ? null : 'Para criar a conta, é preciso aceitar o tratamento dos seus dados.',
    };
    setErrosDaConta(erros);
    if (!temErro(erros)) irParaEtapa(2);
  };

  const aoCriarConta = async () => {
    const erros = validarEndereco(endereco);
    setErrosDoEndereco(erros);
    setFalha(null);
    if (temErro(erros)) return;

    setEnviando(true);
    try {
      const { enderecoSalvo } = await criarConta({ nome, email, senha, endereco });
      avisar(
        enderecoSalvo
          ? 'Conta criada. Boas-vindas ao EcoTec!'
          : 'Conta criada, mas o endereço não foi salvo. Cadastre-o no Perfil.',
        enderecoSalvo ? 'sucesso' : 'info',
      );
      // Com a sessão criada, a navegação troca sozinha para as telas internas.
    } catch (erro) {
      setFalha(paraErroApi(erro).message);
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde
        titulo="Criar conta"
        subtitulo={etapa === 1 ? 'Etapa 1 de 2: seus dados de acesso' : 'Etapa 2 de 2: seu endereço'}
        aoVoltar={() => (etapa === 2 ? irParaEtapa(1) : navigation.goBack())}
      >
        <View
          style={estilos.progresso}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: 2, now: etapa }}
        >
          <View style={[estilos.trecho, estilos.trechoFeito]} />
          <View style={[estilos.trecho, etapa === 2 && estilos.trechoFeito]} />
        </View>
      </CabecalhoVerde>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={rolagem}
          contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          {etapa === 1 ? (
            <View>
              <Texto variante="corpo" cor={cores.tintaSuave} style={estilos.introducao}>
                Com a conta você registra denúncias e acompanha o andamento de cada uma.
              </Texto>

              <Campo
                rotulo="Nome completo"
                icone="account-outline"
                placeholder="Como você se chama"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  limparErroDaConta('nome');
                }}
                erro={errosDaConta.nome}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                maxLength={LIMITES.nome}
                returnKeyType="next"
                onSubmitEditing={() => campoEmail.current?.focus()}
                submitBehavior="submit"
                testID="cadastro-nome"
              />
              <Campo
                ref={campoEmail}
                rotulo="E-mail"
                icone="email-outline"
                placeholder="nome@exemplo.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  limparErroDaConta('email');
                }}
                erro={errosDaConta.email}
                ajuda="Você usa este e-mail para entrar no app."
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                maxLength={LIMITES.email}
                returnKeyType="next"
                onSubmitEditing={() => campoSenha.current?.focus()}
                submitBehavior="submit"
                testID="cadastro-email"
              />
              <Campo
                ref={campoSenha}
                rotulo="Senha"
                icone="lock-outline"
                placeholder="Crie uma senha"
                senha
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  limparErroDaConta('senha');
                }}
                erro={errosDaConta.senha}
                ajuda={`Use pelo menos ${LIMITES.senhaMin} caracteres.`}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                maxLength={LIMITES.senhaMax}
                returnKeyType="next"
                onSubmitEditing={() => campoConfirmacao.current?.focus()}
                submitBehavior="submit"
                testID="cadastro-senha"
              />
              <Campo
                ref={campoConfirmacao}
                rotulo="Confirmar senha"
                icone="lock-outline"
                placeholder="Repita a senha"
                senha
                value={confirmacao}
                onChangeText={(t) => {
                  setConfirmacao(t);
                  limparErroDaConta('confirmacao');
                }}
                erro={errosDaConta.confirmacao}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                maxLength={LIMITES.senhaMax}
                returnKeyType="done"
                testID="cadastro-confirmacao"
              />

              <CaixaDeSelecao
                marcada={aceite}
                aoAlternar={() => {
                  setAceite((v) => !v);
                  limparErroDaConta('aceite');
                }}
                rotulo="Aceito o tratamento dos meus dados conforme a política de privacidade"
                erro={errosDaConta.aceite}
              >
                <Texto variante="apoio" cor={cores.tintaSuave}>
                  Aceito o tratamento dos meus dados para registrar e acompanhar denúncias, conforme a{' '}
                  <Texto
                    variante="apoioForte"
                    cor={cores.folha}
                    style={estilos.sublinhado}
                    onPress={() => navigation.navigate('Privacidade')}
                    accessibilityRole="link"
                  >
                    política de privacidade
                  </Texto>
                  .
                </Texto>
              </CaixaDeSelecao>

              <Botao titulo="Continuar" onPress={aoContinuar} testID="cadastro-continuar" />
            </View>
          ) : (
            <View>
              <Texto variante="corpo" cor={cores.tintaSuave} style={estilos.introducao}>
                O endereço identifica a sua região. Ele não aparece para outros usuários.
              </Texto>

              <CamposDeEndereco
                valor={endereco}
                aoMudar={setEndereco}
                erros={errosDoEndereco}
                aoLimparErro={limparErroDoEndereco}
              />

              {falha ? (
                <Aviso tipo="erro" titulo="Não foi possível criar a conta" style={{ marginBottom: espaco.md }}>
                  {falha}
                </Aviso>
              ) : null}

              <Botao titulo="Criar conta" onPress={aoCriarConta} carregando={enviando} testID="cadastro-criar" />
            </View>
          )}

          <View style={estilos.rodape}>
            <Texto variante="corpo" cor={cores.tintaSuave}>
              Já tem conta?
            </Texto>
            <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="link" hitSlop={10} disabled={enviando}>
              <Texto variante="corpoForte" cor={cores.folha} style={estilos.sublinhado}>
                Entrar
              </Texto>
            </Pressable>
          </View>
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
  progresso: {
    flexDirection: 'row',
    gap: 6,
    marginTop: espaco.sm,
  },
  trecho: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  trechoFeito: {
    backgroundColor: cores.broto,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: espaco.xl,
    paddingTop: espaco.lg,
  },
  introducao: {
    marginBottom: espaco.lg,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: espaco.lg,
  },
  sublinhado: {
    textDecorationLine: 'underline',
  },
});
