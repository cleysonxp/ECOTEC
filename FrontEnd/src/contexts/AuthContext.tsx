import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { criarUsuario, entrar as entrarNaApi } from '../api/autenticacao';
import { aoExpirarSessao, definirToken } from '../api/cliente';
import { criarEndereco } from '../api/enderecos';
import type { UsuarioSessao } from '../api/tipos';
import { cofre } from '../utils/cofre';
import { tokenExpirado } from '../utils/jwt';

const CHAVE_TOKEN = 'ecotec.token';
const CHAVE_USUARIO = 'ecotec.usuario';

export type DadosDeCadastro = {
  nome: string;
  email: string;
  senha: string;
  endereco: { cep: string; estado: string; cidade: string; bairro: string; rua: string };
};

type ContextoAuth = {
  /** true enquanto a sessão salva no aparelho está sendo lida. */
  carregando: boolean;
  usuario: UsuarioSessao | null;
  /** Aviso para a tela de login (ex.: sessão expirada). */
  aviso: string | null;
  limparAviso: () => void;
  entrar: (email: string, senha: string) => Promise<void>;
  /** Cria a conta, entra e grava o endereço. `enderecoSalvo` indica se a última etapa deu certo. */
  criarConta: (dados: DadosDeCadastro) => Promise<{ enderecoSalvo: boolean }>;
  sair: () => Promise<void>;
};

const Contexto = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  /** E-mails cujo usuário já foi criado nesta abertura do app (evita duplicar a conta ao tentar de novo). */
  const contasCriadas = useRef(new Set<string>());

  const encerrar = useCallback(
    async (mensagem: string | null) => {
      tokenRef.current = null;
      definirToken(null);
      setUsuario(null);
      setAviso(mensagem);
      queryClient.clear();
      await Promise.all([cofre.apagar(CHAVE_TOKEN), cofre.apagar(CHAVE_USUARIO)]);
    },
    [queryClient],
  );

  const iniciarSessao = useCallback(async (token: string, dados: UsuarioSessao) => {
    tokenRef.current = token;
    definirToken(token);
    setAviso(null);
    setUsuario(dados);
    try {
      await Promise.all([cofre.gravar(CHAVE_TOKEN, token), cofre.gravar(CHAVE_USUARIO, JSON.stringify(dados))]);
    } catch {
      // Se o aparelho não conseguir gravar, a sessão vale só até o app ser fechado.
    }
  }, []);

  // Recupera a sessão salva ao abrir o app.
  useEffect(() => {
    let ativo = true;
    (async () => {
      const [token, usuarioSalvo] = await Promise.all([cofre.ler(CHAVE_TOKEN), cofre.ler(CHAVE_USUARIO)]);
      if (!ativo) return;
      if (token && usuarioSalvo && !tokenExpirado(token)) {
        try {
          const dados = JSON.parse(usuarioSalvo) as UsuarioSessao;
          tokenRef.current = token;
          definirToken(token);
          setUsuario(dados);
        } catch {
          await encerrar(null);
        }
      } else if (token) {
        await encerrar('Sua sessão expirou. Entre novamente para continuar.');
      }
      if (ativo) setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [encerrar]);

  // O servidor respondeu 401 com a sessão em uso: o token venceu (validade de 2 horas).
  useEffect(() => {
    aoExpirarSessao(() => {
      if (tokenRef.current) {
        void encerrar('Sua sessão expirou. Entre novamente para continuar.');
      }
    });
    return () => aoExpirarSessao(null);
  }, [encerrar]);

  // Ao voltar para o app, confere se o token venceu enquanto ele estava em segundo plano.
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && tokenRef.current && tokenExpirado(tokenRef.current)) {
        void encerrar('Sua sessão expirou. Entre novamente para continuar.');
      }
    });
    return () => assinatura.remove();
  }, [encerrar]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resposta = await entrarNaApi({ email, senha });
      await iniciarSessao(resposta.token, resposta.usuario);
    },
    [iniciarSessao],
  );

  const criarConta = useCallback(
    async (dados: DadosDeCadastro) => {
      const chave = dados.email.trim().toLowerCase();

      // 1. POST /usuario
      if (!contasCriadas.current.has(chave)) {
        await criarUsuario({ nome: dados.nome, email: dados.email, senha: dados.senha });
        contasCriadas.current.add(chave);
      }

      // 2. POST /auth/login - a rota de endereço exige token e o ID do usuário.
      const resposta = await entrarNaApi({ email: dados.email, senha: dados.senha });
      definirToken(resposta.token);

      // 3. POST /endereco
      let enderecoSalvo = true;
      try {
        await criarEndereco({ ...dados.endereco, idUsuario: resposta.usuario.idUsuario });
      } catch {
        enderecoSalvo = false; // a conta existe; o endereço pode ser cadastrado depois, no Perfil.
      }

      await iniciarSessao(resposta.token, resposta.usuario);
      return { enderecoSalvo };
    },
    [iniciarSessao],
  );

  const sair = useCallback(() => encerrar(null), [encerrar]);
  const limparAviso = useCallback(() => setAviso(null), []);

  const valor = useMemo<ContextoAuth>(
    () => ({ carregando, usuario, aviso, limparAviso, entrar, criarConta, sair }),
    [carregando, usuario, aviso, limparAviso, entrar, criarConta, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return contexto;
}

/**
 * Usuário autenticado, para telas que só existem depois do login.
 * Guarda o último usuário conhecido para a tela não quebrar durante a animação de saída.
 */
export function useUsuario(): UsuarioSessao {
  const { usuario } = useAuth();
  const ultimo = useRef(usuario);
  if (usuario) ultimo.current = usuario;
  if (!ultimo.current) throw new Error('Tela acessada sem usuário autenticado.');
  return ultimo.current;
}
