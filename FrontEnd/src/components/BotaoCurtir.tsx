import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useAvisos } from '../contexts/AvisosContext';
import { useCurtidas } from '../contexts/CurtidasContext';
import { ALVO_DE_TOQUE, cores, espaco, raio } from '../theme';
import { mensagemDeErro } from '../api/cliente';
import { toqueLeve } from '../utils/vibrar';
import { Icone } from './Icone';
import { Texto } from './Texto';

/** Curtir / remover curtida de uma denúncia, com o total de curtidas. */
export function BotaoCurtir({ idDenuncia, total, grande = false }: { idDenuncia: number; total: number; grande?: boolean }) {
  const { curtiu, alternar } = useCurtidas();
  const { avisar } = useAvisos();
  const marcada = curtiu(idDenuncia);

  const aoTocar = () => {
    toqueLeve();
    alternar(idDenuncia).catch((erro) => avisar(mensagemDeErro(erro), 'erro'));
  };

  return (
    <Pressable
      onPress={aoTocar}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: marcada }}
      accessibilityLabel={`${marcada ? 'Remover curtida' : 'Curtir denúncia'}. ${total} ${total === 1 ? 'curtida' : 'curtidas'}.`}
      style={({ pressed }) => [
        estilos.botao,
        grande && estilos.grande,
        marcada && { backgroundColor: cores.orvalho, borderColor: cores.menta },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icone nome={marcada ? 'heart' : 'heart-outline'} tamanho={grande ? 22 : 20} cor={marcada ? cores.folha : cores.tintaSuave} />
      <Texto variante="apoioForte" cor={marcada ? cores.folha : cores.tintaSuave}>
        {grande ? `${total} ${total === 1 ? 'curtida' : 'curtidas'}` : String(total)}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: ALVO_DE_TOQUE - 8,
    minWidth: 64,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.pilula,
    borderWidth: 1.5,
    borderColor: cores.linha,
    backgroundColor: cores.branco,
  },
  grande: {
    minHeight: 54,
    borderRadius: raio.lg,
    paddingHorizontal: espaco.md,
  },
});
