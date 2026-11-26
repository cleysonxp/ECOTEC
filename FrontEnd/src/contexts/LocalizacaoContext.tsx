import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Coordenadas } from '../utils/formatadores';
import { lugarDoEndereco } from '../utils/geocodificacao';
import { comTempoLimite } from '../utils/tempo';

export type SituacaoLocalizacao = 'carregando' | 'ok' | 'negada' | 'desligada' | 'erro';

type ContextoLocalizacao = {
  situacao: SituacaoLocalizacao;
  coordenadas: Coordenadas | null;
  /** Nome do lugar atual, como "Centro, Santana de Parnaíba". */
  lugar: string | null;
  /** false quando o sistema não deixa mais o app pedir a permissão (é preciso abrir os Ajustes). */
  podePedirDeNovo: boolean;
  atualizar: () => Promise<void>;
  /** Raio de busca do feed e do mapa, em km. */
  raioKm: number;
  definirRaio: (km: number) => void;
};

/** Opções de raio oferecidas ao usuário (o back-end aceita até 100 km). */
export const RAIOS_KM = [2, 5, 10, 25, 50] as const;

const Contexto = createContext<ContextoLocalizacao | null>(null);

/**
 * Localização do usuário, compartilhada entre o feed e o mapa (RF03).
 * Pede a permissão uma vez, mostra primeiro a última posição conhecida e depois refina.
 * `ativo` deve ser true somente quando há usuário autenticado.
 */
export function LocalizacaoProvider({ children, ativo = true }: { children: React.ReactNode; ativo?: boolean }) {
  const [situacao, setSituacao] = useState<SituacaoLocalizacao>('carregando');
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [lugar, setLugar] = useState<string | null>(null);
  const [podePedirDeNovo, setPodePedirDeNovo] = useState(true);
  const [raioKm, definirRaio] = useState<number>(10);
  const emAndamento = useRef(false);
  const montado = useRef(true);

  const atualizar = useCallback(async () => {
    if (emAndamento.current) return;
    emAndamento.current = true;
    try {
      const ligada = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!ligada) {
        if (montado.current) setSituacao('desligada');
        return;
      }

      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!montado.current) return;
      setPodePedirDeNovo(permissao.canAskAgain);
      if (!permissao.granted) {
        setSituacao('negada');
        return;
      }

      // Resposta rápida com a última posição conhecida, quando existir.
      const ultima = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 }).catch(() => null);
      if (ultima && montado.current) {
        setCoordenadas({ latitude: ultima.coords.latitude, longitude: ultima.coords.longitude });
        setSituacao('ok');
      }

      // Em lugares fechados o GPS pode demorar: depois de 15 s o app para de esperar.
      const atual = await comTempoLimite(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        15000,
      );
      if (!montado.current) return;
      const ponto = { latitude: atual.coords.latitude, longitude: atual.coords.longitude };
      setCoordenadas(ponto);
      setSituacao('ok');

      const nome = await lugarDoEndereco(ponto);
      if (montado.current && nome) setLugar(nome);
    } catch {
      if (montado.current) setSituacao((anterior) => (anterior === 'ok' ? 'ok' : 'erro'));
    } finally {
      emAndamento.current = false;
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // Só pede a localização depois do login, para a permissão não aparecer na tela de entrada.
  useEffect(() => {
    if (ativo) void atualizar();
  }, [ativo, atualizar]);

  const valor = useMemo(
    () => ({ situacao, coordenadas, lugar, podePedirDeNovo, atualizar, raioKm, definirRaio }),
    [situacao, coordenadas, lugar, podePedirDeNovo, atualizar, raioKm],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLocalizacao(): ContextoLocalizacao {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useLocalizacao precisa estar dentro de <LocalizacaoProvider>.');
  return contexto;
}
