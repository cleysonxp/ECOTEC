import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, espaco, raio } from '../theme';
import { Icone, NomeIcone } from './Icone';
import { Texto } from './Texto';

export type AcaoDaFolha = {
  titulo: string;
  descricao?: string;
  icone: NomeIcone;
  onPress: () => void;
  perigo?: boolean;
};

type Props = {
  visivel: boolean;
  titulo: string;
  texto?: string;
  acoes: AcaoDaFolha[];
  aoFechar: () => void;
  rotuloCancelar?: string;
};

/** Painel que sobe da parte de baixo da tela com uma lista de opções (substitui os alertas do sistema). */
export function FolhaDeAcoes({ visivel, titulo, texto, acoes, aoFechar, rotuloCancelar = 'Cancelar' }: Props) {
  const insets = useSafeAreaInsets();
  const pendente = useRef<(() => void) | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * A ação escolhida só roda depois que o painel terminou de fechar.
   * No iOS, abrir a câmera, a galeria ou outra tela enquanto um painel ainda está
   * sendo fechado faz o sistema ignorar a nova tela.
   */
  const executarPendente = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    const acao = pendente.current;
    pendente.current = null;
    acao?.();
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const escolher = (acao: AcaoDaFolha) => {
    pendente.current = acao.onPress;
    aoFechar();
    // onDismiss avisa quando o painel sumiu (iOS); o temporizador cobre as plataformas sem esse aviso.
    temporizador.current = setTimeout(executarPendente, Platform.OS === 'ios' ? 700 : 250);
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
      onDismiss={executarPendente}
      statusBarTranslucent
    >
      <View style={estilos.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} accessibilityLabel="Fechar" accessibilityRole="button" />
        <View style={[estilos.folha, { paddingBottom: insets.bottom + espaco.md }]} accessibilityViewIsModal>
          <View style={estilos.alca} />
          <Texto variante="subtitulo" accessibilityRole="header">
            {titulo}
          </Texto>
          {texto ? (
            <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginTop: 4 }}>
              {texto}
            </Texto>
          ) : null}

          <View style={{ marginTop: espaco.sm }}>
            {acoes.map((acao) => (
              <Pressable
                key={acao.titulo}
                onPress={() => escolher(acao)}
                accessibilityRole="button"
                accessibilityLabel={acao.titulo}
                accessibilityHint={acao.descricao}
                style={({ pressed }) => [estilos.acao, pressed && { backgroundColor: cores.orvalho }]}
              >
                <View style={[estilos.iconeAcao, acao.perigo && { backgroundColor: cores.erroFundo }]}>
                  <Icone nome={acao.icone} tamanho={22} cor={acao.perigo ? cores.erro : cores.folha} />
                </View>
                <View style={{ flex: 1 }}>
                  <Texto variante="corpoForte" cor={acao.perigo ? cores.erro : cores.tinta}>
                    {acao.titulo}
                  </Texto>
                  {acao.descricao ? (
                    <Texto variante="apoio" cor={cores.tintaSuave}>
                      {acao.descricao}
                    </Texto>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={aoFechar}
            accessibilityRole="button"
            accessibilityLabel={rotuloCancelar}
            style={({ pressed }) => [estilos.cancelar, pressed && { backgroundColor: cores.orvalho }]}
          >
            <Texto variante="corpoForte" cor={cores.tintaSuave}>
              {rotuloCancelar}
            </Texto>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: cores.veu,
  },
  folha: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: raio.xl,
    borderTopRightRadius: raio.xl,
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.sm,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.linha,
    marginBottom: espaco.md,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    minHeight: 60,
    paddingVertical: espaco.xs,
    paddingHorizontal: espaco.xs,
    borderRadius: raio.md,
  },
  iconeAcao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelar: {
    marginTop: espaco.xs,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raio.md,
  },
});
