import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { paraErroApi } from '../api/cliente';
import { curtirDenuncia, removerCurtida } from '../api/denuncias';
import { useAuth } from './AuthContext';

type ContextoCurtidas = {
  curtiu: (idDenuncia: number) => boolean;
  /** Curte ou remove a curtida. Rejeita com ErroApi quando o servidor não confirma. */
  alternar: (idDenuncia: number) => Promise<void>;
};

const Contexto = createContext<ContextoCurtidas | null>(null);

/** Atualiza o número de curtidas da denúncia em todas as listas já carregadas. */
function ajustarContagem(queryClient: QueryClient, idDenuncia: number, diferenca: number) {
  queryClient.setQueriesData({ queryKey: ['denuncias'] }, (dados: unknown) => {
    const ajustar = (d: any) =>
      d && d.id === idDenuncia ? { ...d, curtidas: Math.max(0, (d.curtidas ?? 0) + diferenca) } : d;
    if (Array.isArray(dados)) return dados.map(ajustar);
    if (dados && typeof dados === 'object') return ajustar(dados);
    return dados;
  });
}

/**
 * Curtidas do usuário (RF11 / casos de teste 9 e 10).
 *
 * A API informa quantas curtidas a denúncia tem, mas não se o usuário atual já curtiu.
 * Por isso o app guarda no aparelho as denúncias curtidas por este usuário e se corrige
 * sozinho com as respostas do servidor (400 "já curtiu" / 404 "ainda não curtiu").
 */
export function CurtidasProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();
  const [curtidas, setCurtidas] = useState<Set<number>>(new Set());
  const emAndamento = useRef(new Set<number>());
  const chave = usuario ? `ecotec.curtidas.${usuario.idUsuario}` : null;

  useEffect(() => {
    let ativo = true;
    setCurtidas(new Set());
    if (!chave) return;
    AsyncStorage.getItem(chave)
      .then((salvo) => {
        if (ativo && salvo) setCurtidas(new Set(JSON.parse(salvo) as number[]));
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [chave]);

  const marcar = useCallback(
    (idDenuncia: number, curtida: boolean) => {
      setCurtidas((anterior) => {
        const proximo = new Set(anterior);
        if (curtida) proximo.add(idDenuncia);
        else proximo.delete(idDenuncia);
        if (chave) AsyncStorage.setItem(chave, JSON.stringify([...proximo])).catch(() => undefined);
        return proximo;
      });
    },
    [chave],
  );

  const alternar = useCallback(
    async (idDenuncia: number) => {
      if (emAndamento.current.has(idDenuncia)) return;
      emAndamento.current.add(idDenuncia);
      const jaCurtia = curtidas.has(idDenuncia);

      // Resposta imediata na tela; se o servidor recusar, desfaz.
      marcar(idDenuncia, !jaCurtia);
      ajustarContagem(queryClient, idDenuncia, jaCurtia ? -1 : 1);

      try {
        if (jaCurtia) await removerCurtida(idDenuncia);
        else await curtirDenuncia(idDenuncia);
      } catch (erro) {
        const e = paraErroApi(erro);
        if (!jaCurtia && e.status === 400) {
          // O servidor já tinha a curtida deste usuário: mantém marcada, sem somar de novo.
          ajustarContagem(queryClient, idDenuncia, -1);
        } else if (jaCurtia && e.status === 404) {
          // O servidor não tinha a curtida: mantém desmarcada, sem subtrair.
          ajustarContagem(queryClient, idDenuncia, 1);
        } else {
          marcar(idDenuncia, jaCurtia);
          ajustarContagem(queryClient, idDenuncia, jaCurtia ? 1 : -1);
          throw e;
        }
      } finally {
        emAndamento.current.delete(idDenuncia);
      }
    },
    [curtidas, marcar, queryClient],
  );

  const valor = useMemo<ContextoCurtidas>(
    () => ({ curtiu: (id) => curtidas.has(id), alternar }),
    [curtidas, alternar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCurtidas(): ContextoCurtidas {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useCurtidas precisa estar dentro de <CurtidasProvider>.');
  return contexto;
}
