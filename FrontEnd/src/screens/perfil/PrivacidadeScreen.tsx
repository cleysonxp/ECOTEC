import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarraStatus } from '../../components/BarraStatus';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Icone, NomeIcone } from '../../components/Icone';
import { Texto } from '../../components/Texto';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco, raio } from '../../theme';

type Bloco = { icone: NomeIcone; titulo: string; itens: string[] };

const BLOCOS: Bloco[] = [
  {
    icone: 'account-outline',
    titulo: 'O que o EcoTec coleta',
    itens: [
      'Cadastro: nome, e-mail e senha. A senha é guardada embaralhada (hash BCrypt) e ninguém consegue lê-la.',
      'Endereço: CEP, estado, cidade, bairro e rua, para identificar a sua região.',
      'Denúncias: categoria, título, descrição, fotos e vídeo que você anexar, data, hora e o local da ocorrência (coordenadas do GPS e endereço).',
      'Localização do aparelho: usada só com o app aberto, para mostrar denúncias perto de você e marcar o local de uma nova denúncia.',
    ],
  },
  {
    icone: 'bullhorn-outline',
    titulo: 'Para que os dados são usados',
    itens: [
      'Registrar suas denúncias e mostrar a situação de cada uma.',
      'Montar o feed e o mapa com as denúncias da sua região.',
      'Está prevista a integração com órgãos ambientais. Quando ela existir, os dados da denúncia serão enviados ao órgão responsável.',
    ],
  },
  {
    icone: 'account-group-outline',
    titulo: 'O que outras pessoas veem',
    itens: [
      'Suas denúncias aparecem no feed para usuários da região, com seu primeiro nome e a inicial do sobrenome.',
      'Seu e-mail e seu endereço não aparecem para outros usuários.',
    ],
  },
  {
    icone: 'cellphone-check',
    titulo: 'O que fica neste aparelho',
    itens: [
      'A sua sessão, no armazenamento seguro do celular, para você não precisar entrar toda vez. Ela é apagada quando você sai da conta.',
      'A lista das denúncias que você curtiu.',
    ],
  },
  {
    icone: 'shield-check-outline',
    titulo: 'Seus direitos',
    itens: [
      'Pela LGPD, você pode pedir acesso, correção ou exclusão dos seus dados, e retirar o consentimento quando quiser.',
      'Para isso, fale com a equipe responsável pelo EcoTec.',
    ],
  },
];

/** Aviso de privacidade em linguagem simples (RNF07 - LGPD). */
export function PrivacidadeScreen({ navigation }: TelaProps<'Privacidade'>) {
  const insets = useSafeAreaInsets();
  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />
      <CabecalhoVerde titulo="Privacidade e dados" aoVoltar={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[estilos.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}>
        <Texto variante="corpo" cor={cores.tintaSuave}>
          O EcoTec trata dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Aqui está,
          em linguagem simples, o que é coletado e por quê.
        </Texto>

        {BLOCOS.map((bloco) => (
          <View key={bloco.titulo} style={estilos.bloco}>
            <View style={estilos.tituloBloco}>
              <View style={estilos.icone}>
                <Icone nome={bloco.icone} tamanho={20} cor={cores.folha} />
              </View>
              <Texto variante="subtitulo" accessibilityRole="header" style={{ flex: 1 }}>
                {bloco.titulo}
              </Texto>
            </View>
            {bloco.itens.map((item) => (
              <View key={item} style={estilos.item}>
                <View style={estilos.marcador} />
                <Texto variante="corpo" style={{ flex: 1 }}>
                  {item}
                </Texto>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.nevoa,
  },
  conteudo: {
    padding: espaco.lg,
    gap: espaco.md,
  },
  bloco: {
    backgroundColor: cores.branco,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.md,
    gap: espaco.sm,
  },
  tituloBloco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  icone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
  marcador: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.broto,
    marginTop: 9,
  },
});
