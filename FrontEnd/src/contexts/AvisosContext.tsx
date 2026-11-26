import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icone, NomeIcone } from '../components/Icone';
import { Texto } from '../components/Texto';
import { cores, espaco, raio } from '../theme';

type Tipo = 'sucesso' | 'erro' | 'info';
type Aviso = { texto: string; tipo: Tipo; chave: number };

const Contexto = createContext<{ avisar: (texto: string, tipo?: Tipo) => void } | null>(null);

const ICONES: Record<Tipo, NomeIcone> = {
  sucesso: 'check-circle-outline',
  erro: 'alert-circle-outline',
  info: 'information-outline',
};

/** Avisos rápidos que aparecem na parte de baixo da tela e somem sozinhos. */
export function AvisosProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const avisar = useCallback((texto: string, tipo: Tipo = 'info') => {
    setAviso({ texto, tipo, chave: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    opacidade.setValue(0);
    Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    temporizador.current = setTimeout(() => {
      Animated.timing(opacidade, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setAviso(null);
      });
    }, 3600);
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [aviso, opacidade]);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      {aviso ? (
        <View pointerEvents="none" style={[estilos.area, { bottom: insets.bottom + 96 }]}>
          <Animated.View
            style={[estilos.caixa, { opacity: opacidade }]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <Icone
              nome={ICONES[aviso.tipo]}
              tamanho={20}
              cor={aviso.tipo === 'erro' ? '#FFB4AB' : cores.menta}
            />
            <Texto variante="apoioForte" cor={cores.branco} style={{ flex: 1 }}>
              {aviso.texto}
            </Texto>
          </Animated.View>
        </View>
      ) : null}
    </Contexto.Provider>
  );
}

export function useAvisos() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAvisos precisa estar dentro de <AvisosProvider>.');
  return contexto;
}

const estilos = StyleSheet.create({
  area: {
    position: 'absolute',
    left: espaco.md,
    right: espaco.md,
    alignItems: 'center',
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    maxWidth: 480,
    backgroundColor: cores.mata,
    borderRadius: raio.md,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
  },
});
