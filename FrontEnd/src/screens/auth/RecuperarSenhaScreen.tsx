import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RecursoIndisponivel, solicitarRecuperacaoDeSenha } from '../../api/autenticacao';
import { mensagemDeErro } from '../../api/cliente';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Campo } from '../../components/Campo';
import { Icone } from '../../components/Icone';
import { Texto } from '../../components/Texto';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco } from '../../theme';
import { LIMITES, validarEmail } from '../../utils/validacao';

type Resultado = { tipo: 'enviado' | 'indisponivel' | 'erro'; texto: string };

export function RecuperarSenhaScreen({ navigation, route }: TelaProps<'RecuperarSenha'>) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const aoEnviar = async () => {
    const problema = validarEmail(email);
    setErro(problema);
    setResultado(null);
    if (problema) return;

    setEnviando(true);
    try {
      await solicitarRecuperacaoDeSenha(email.trim());
      setResultado({ tipo: 'enviado', texto: `Enviamos as instruções para ${email.trim()}. Confira também a caixa de spam.` });
    } catch (falha) {
      if (falha instanceof RecursoIndisponivel) {
        setResultado({ tipo: 'indisponivel', texto: falha.message });
      } else {
        setResultado({ tipo: 'erro', texto: mensagemDeErro(falha) });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde titulo="Recuperar senha" aoVoltar={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.icone}>
            <Icone nome="email-outline" tamanho={30} cor={cores.folha} />
          </View>
          <Texto variante="titulo" accessibilityRole="header">
            Esqueceu a senha?
          </Texto>
          <Texto variante="corpo" cor={cores.tintaSuave} style={{ marginTop: espaco.xs, marginBottom: espaco.xl }}>
            Informe o e-mail da sua conta. Você recebe por ele as instruções para criar uma nova senha.
          </Texto>

          <Campo
            rotulo="E-mail da conta"
            icone="email-outline"
            placeholder="nome@exemplo.com"
            value={email}
            onChangeText={(texto) => {
              setEmail(texto);
              if (erro) setErro(null);
            }}
            erro={erro}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={LIMITES.email}
            returnKeyType="send"
            onSubmitEditing={aoEnviar}
          />

          {resultado?.tipo === 'enviado' ? (
            <Aviso tipo="sucesso" titulo="Instruções enviadas" style={{ marginBottom: espaco.md }}>
              {resultado.texto}
            </Aviso>
          ) : null}
          {resultado?.tipo === 'indisponivel' ? (
            <Aviso tipo="alerta" titulo="Recuperação por e-mail em implantação" style={{ marginBottom: espaco.md }}>
              {resultado.texto} Por enquanto, peça a redefinição da senha à equipe do EcoTec.
            </Aviso>
          ) : null}
          {resultado?.tipo === 'erro' ? (
            <Aviso tipo="erro" style={{ marginBottom: espaco.md }}>
              {resultado.texto}
            </Aviso>
          ) : null}

          <Botao titulo="Enviar instruções" icone="email-outline" onPress={aoEnviar} carregando={enviando} />
          <Botao
            titulo="Voltar para o login"
            variante="suave"
            onPress={() => navigation.goBack()}
            style={{ marginTop: espaco.sm }}
          />
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
    flexGrow: 1,
    paddingHorizontal: espaco.xl,
    paddingTop: espaco.xl,
  },
  icone: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.md,
  },
});
