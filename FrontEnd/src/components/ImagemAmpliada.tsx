import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '../theme';
import { BotaoIcone } from './BotaoIcone';

/** Mostra a foto da denúncia em tela cheia (com zoom por gesto de pinça no iOS). */
export function ImagemAmpliada({ uri, visivel, aoFechar }: { uri: string | null; visivel: boolean; aoFechar: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel && !!uri} transparent animationType="fade" onRequestClose={aoFechar} statusBarTranslucent>
      <View style={estilos.fundo} accessibilityViewIsModal>
        <ScrollView
          maximumZoomScale={4}
          minimumZoomScale={1}
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width, height, alignItems: 'center', justifyContent: 'center' }}
        >
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width, height: height * 0.8 }}
              resizeMode="contain"
              accessibilityLabel="Foto da denúncia ampliada"
            />
          ) : null}
        </ScrollView>
        <BotaoIcone
          icone="close"
          rotulo="Fechar foto"
          onPress={aoFechar}
          cor={cores.branco}
          fundo="rgba(255,255,255,0.18)"
          style={{ position: 'absolute', top: insets.top + 8, right: 16 }}
        />
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(5, 20, 15, 0.96)',
  },
});
