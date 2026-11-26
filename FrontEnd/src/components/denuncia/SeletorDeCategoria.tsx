import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { cores, espaco, raio } from '../../theme';
import { CATEGORIAS } from '../../utils/categorias';
import { Icone } from '../Icone';
import { Texto } from '../Texto';

type Props = {
  selecionada: number | null;
  aoSelecionar: (id: number) => void;
  erro?: string | null;
};

/** As sete categorias de denúncia, em blocos grandes e fáceis de tocar. */
export function SeletorDeCategoria({ selecionada, aoSelecionar, erro }: Props) {
  const escolhida = CATEGORIAS.find((c) => c.id === selecionada);
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Categoria da denúncia">
      <View style={estilos.grade}>
        {CATEGORIAS.map((categoria) => {
          const ativa = categoria.id === selecionada;
          return (
            <Pressable
              key={categoria.id}
              onPress={() => aoSelecionar(categoria.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativa }}
              accessibilityLabel={categoria.nome}
              accessibilityHint={categoria.explicacao}
              style={({ pressed }) => [
                estilos.bloco,
                ativa && estilos.blocoAtivo,
                pressed && { opacity: 0.8 },
              ]}
              testID={`categoria-${categoria.id}`}
            >
              <View style={[estilos.icone, ativa && { backgroundColor: cores.folha }]}>
                <Icone nome={categoria.icone} tamanho={22} cor={ativa ? cores.branco : cores.folha} />
              </View>
              <Texto variante="apoioForte" cor={ativa ? cores.mata : cores.tinta} style={{ flex: 1 }} numberOfLines={3}>
                {categoria.curto}
              </Texto>
            </Pressable>
          );
        })}
      </View>

      {erro ? (
        <View style={estilos.mensagem} accessibilityLiveRegion="polite">
          <Icone nome="alert-circle-outline" tamanho={16} cor={cores.erro} />
          <Texto variante="apoio" cor={cores.erro} style={{ flex: 1 }}>
            {erro}
          </Texto>
        </View>
      ) : escolhida ? (
        <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginTop: espaco.xs }}>
          {escolhida.explicacao}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.xs,
  },
  bloco: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    minHeight: 72,
    paddingHorizontal: espaco.sm,
    paddingVertical: espaco.xs,
    borderRadius: raio.md,
    borderWidth: 1.5,
    borderColor: cores.linha,
    backgroundColor: cores.branco,
  },
  blocoAtivo: {
    borderColor: cores.folha,
    borderWidth: 2,
    backgroundColor: cores.orvalho,
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mensagem: {
    flexDirection: 'row',
    gap: 6,
    marginTop: espaco.xs,
  },
});
