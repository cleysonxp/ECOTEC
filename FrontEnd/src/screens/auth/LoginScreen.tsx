import React, { ComponentRef, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErroApi, paraErroApi, urlDaApi } from '../../api/cliente';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { Campo } from '../../components/Campo';
import { CurvasDeNivel } from '../../components/CurvasDeNivel';
import { Marca } from '../../components/Logo';
import { Texto } from '../../components/Texto';
import { useAuth } from '../../contexts/AuthContext';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco, raio } from '../../theme';
import { LIMITES, validarEmail } from '../../utils/validacao';

/** Explica a falha de login em linguagem simples (RF02: feedback de erro). */
function explicarErro(erro: ErroApi): { texto: string; deConexao: boolean } {
  if (erro.status === 401) return { texto: 'E-mail ou senha incorretos. Confira os dados e tente de novo.', deConexao: false };
  if (erro.tipo === 'rede' || erro.tipo === 'tempo') return { texto: erro.message, deConexao: true };
  return { texto: erro.message, deConexao: false };
}

export function LoginScreen({ navigation }: TelaProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { entrar, aviso, limparAviso } = useAuth();
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string | null; senha?: string | null }>({});
  const [falha, setFalha] = useState<{ texto: string; deConexao: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const aoEntrar = async () => {
    const novosErros = {
      email: validarEmail(email),
      senha: senha.length === 0 ? 'Informe sua senha.' : null,
    };
    setErros(novosErros);
    setFalha(null);
    if (novosErros.email || novosErros.senha) return;

    setEnviando(true);
    limparAviso();
    try {
      await entrar(email, senha);
      // Com a sessão criada, a navegação troca sozinha para as telas internas.
    } catch (erro) {
      setFalha(explicarErro(paraErroApi(erro)));
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={[estilos.topo, { paddingTop: insets.top + espaco.xxl }]}>
            <CurvasDeNivel />
            <Marca tema="escuro" tamanho={52} />
            <Texto variante="destaque" cor={cores.branco} style={{ marginTop: espaco.xl }} accessibilityRole="header">
              Viu um problema ambiental? Registre em poucos toques.
            </Texto>
            <Texto variante="corpo" cor={cores.menta} style={{ marginTop: espaco.xs }}>
              Sua denúncia entra no mapa da região e você acompanha o andamento.
            </Texto>
          </View>

          <View style={[estilos.folha, { paddingBottom: insets.bottom + espaco.xl }]}>
            <Texto variante="titulo" accessibilityRole="header" style={{ marginBottom: espaco.md }}>
              Entrar
            </Texto>

            {aviso ? (
              <Aviso tipo="alerta" style={{ marginBottom: espaco.md }}>
                {aviso}
              </Aviso>
            ) : null}

            {falha ? (
              <Aviso
                tipo="erro"
                style={{ marginBottom: espaco.md }}
                acao={
                  falha.deConexao ? (
                    <Pressable onPress={() => navigation.navigate('Conexao')} accessibilityRole="link" hitSlop={8}>
                      <Texto variante="apoioForte" cor={cores.erro} style={estilos.sublinhado}>
                        Conferir conexão com o servidor
                      </Texto>
                    </Pressable>
                  ) : undefined
                }
              >
                {falha.texto}
              </Aviso>
            ) : null}

            <Campo
              rotulo="E-mail"
              icone="email-outline"
              placeholder="nome@exemplo.com"
              value={email}
              onChangeText={(texto) => {
                setEmail(texto);
                if (erros.email) setErros((e) => ({ ...e, email: null }));
              }}
              erro={erros.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              maxLength={LIMITES.email}
              returnKeyType="next"
              onSubmitEditing={() => campoSenha.current?.focus()}
              submitBehavior="submit"
              testID="login-email"
            />

            <Campo
              ref={campoSenha}
              rotulo="Senha"
              icone="lock-outline"
              placeholder="Sua senha"
              senha
              value={senha}
              onChangeText={(texto) => {
                setSenha(texto);
                if (erros.senha) setErros((e) => ({ ...e, senha: null }));
              }}
              erro={erros.senha}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              maxLength={LIMITES.senhaMax}
              returnKeyType="go"
              onSubmitEditing={aoEntrar}
              testID="login-senha"
            />

            <Pressable
              onPress={() => navigation.navigate('RecuperarSenha', { email: email.trim() })}
              accessibilityRole="link"
              hitSlop={10}
              style={estilos.esqueci}
            >
              <Texto variante="apoioForte" cor={cores.folha}>
                Esqueci minha senha
              </Texto>
            </Pressable>

            <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} testID="login-entrar" />

            <View style={estilos.criarConta}>
              <Texto variante="corpo" cor={cores.tintaSuave}>
                Ainda não tem conta?
              </Texto>
              <Pressable onPress={() => navigation.navigate('Cadastro')} accessibilityRole="link" hitSlop={10} testID="login-criar-conta">
                <Texto variante="corpoForte" cor={cores.folha} style={estilos.sublinhado}>
                  Criar conta
                </Texto>
              </Pressable>
            </View>

            {__DEV__ ? (
              <Pressable
                onPress={() => navigation.navigate('Conexao')}
                accessibilityRole="link"
                accessibilityLabel="Configurar conexão com o servidor"
                hitSlop={8}
                style={estilos.servidor}
              >
                <Texto variante="legenda" cor={cores.tintaFraca} centro>
                  Servidor: {urlDaApi().replace(/^https?:\/\//, '')}
                </Texto>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.mata,
  },
  topo: {
    paddingHorizontal: espaco.xl,
    paddingBottom: espaco.xxl + espaco.md,
    overflow: 'hidden',
  },
  folha: {
    flexGrow: 1,
    marginTop: -espaco.xl,
    backgroundColor: cores.branco,
    borderTopLeftRadius: raio.xl + 4,
    borderTopRightRadius: raio.xl + 4,
    paddingHorizontal: espaco.xl,
    paddingTop: espaco.xl,
  },
  esqueci: {
    alignSelf: 'flex-end',
    marginTop: -espaco.xxs,
    marginBottom: espaco.lg,
    minHeight: 32,
    justifyContent: 'center',
  },
  criarConta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: espaco.lg,
  },
  sublinhado: {
    textDecorationLine: 'underline',
  },
  servidor: {
    marginTop: espaco.xl,
    minHeight: 32,
    justifyContent: 'center',
  },
});
