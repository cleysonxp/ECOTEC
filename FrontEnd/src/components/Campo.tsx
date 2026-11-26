import React, { ComponentRef, forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { ALVO_DE_TOQUE, cores, espaco, estiloDaFonte, raio } from '../theme';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

type Props = Omit<TextInputProps, 'style'> & {
  rotulo: string;
  erro?: string | null;
  ajuda?: string;
  icone?: NomeIcone;
  senha?: boolean;
  opcional?: boolean;
  direita?: React.ReactNode;
  multilinha?: boolean;
};

// No navegador, o campo já mostra o foco pela borda verde: dispensa o contorno padrão.
const SEM_CONTORNO_WEB = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

/** Campo de formulário com rótulo visível, mensagem de erro e suporte a leitores de tela. */
export const Campo = forwardRef<ComponentRef<typeof TextInput>, Props>(function Campo(
  { rotulo, erro, ajuda, icone, senha, opcional, direita, multilinha, onFocus, onBlur, editable = true, ...resto },
  ref,
) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const corDaBorda = erro ? cores.erro : focado ? cores.folha : cores.linha;

  return (
    <View style={estilos.grupo}>
      <View style={estilos.linhaRotulo}>
        <Texto variante="apoioForte">{rotulo}</Texto>
        {opcional ? (
          <Texto variante="legenda" cor={cores.tintaFraca}>
            opcional
          </Texto>
        ) : null}
      </View>

      <View
        style={[
          estilos.caixa,
          multilinha && estilos.caixaMultilinha,
          { borderColor: corDaBorda, backgroundColor: editable ? cores.branco : cores.nevoa },
          (focado || !!erro) && estilos.caixaAtiva,
        ]}
      >
        {icone ? (
          <View style={estilos.icone}>
            <Icone nome={icone} tamanho={20} cor={focado ? cores.folha : cores.tintaFraca} />
          </View>
        ) : null}

        <TextInput
          ref={ref}
          {...resto}
          editable={editable}
          multiline={multilinha}
          textAlignVertical={multilinha ? 'top' : 'center'}
          secureTextEntry={senha && !senhaVisivel}
          placeholderTextColor={cores.tintaFraca}
          selectionColor={cores.folha}
          accessibilityLabel={rotulo}
          accessibilityHint={erro ?? ajuda}
          maxFontSizeMultiplier={1.3}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[
            estilos.entrada,
            estiloDaFonte('texto'),
            multilinha && estilos.entradaMultilinha,
            !icone && { paddingLeft: espaco.md },
            SEM_CONTORNO_WEB,
          ]}
        />

        {senha ? (
          <Pressable
            onPress={() => setSenhaVisivel((v) => !v)}
            hitSlop={8}
            style={estilos.acao}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icone nome={senhaVisivel ? 'eye-off-outline' : 'eye-outline'} tamanho={22} cor={cores.tintaSuave} />
          </Pressable>
        ) : null}
        {direita ? <View style={estilos.acao}>{direita}</View> : null}
      </View>

      {erro ? (
        <View style={estilos.linhaErro} accessibilityLiveRegion="polite">
          <Icone nome="alert-circle-outline" tamanho={16} cor={cores.erro} />
          <Texto variante="apoio" cor={cores.erro} style={{ flex: 1 }}>
            {erro}
          </Texto>
        </View>
      ) : ajuda ? (
        <Texto variante="apoio" cor={cores.tintaSuave} style={estilos.ajuda}>
          {ajuda}
        </Texto>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: espaco.md,
  },
  linhaRotulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1.5,
    borderRadius: raio.md,
  },
  caixaAtiva: {
    borderWidth: 2,
  },
  caixaMultilinha: {
    alignItems: 'flex-start',
  },
  icone: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  entrada: {
    flex: 1,
    minHeight: 50,
    paddingRight: espaco.md,
    paddingVertical: 0,
    fontSize: 16,
    color: cores.tinta,
  },
  entradaMultilinha: {
    minHeight: 112,
    paddingTop: espaco.sm,
    paddingBottom: espaco.sm,
    lineHeight: 22,
  },
  acao: {
    minWidth: ALVO_DE_TOQUE,
    minHeight: ALVO_DE_TOQUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaErro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  ajuda: {
    marginTop: 6,
  },
});
