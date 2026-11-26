import { Linking, Platform, Share } from 'react-native';
import { Denuncia, tituloDeExibicao } from './denuncia';
import { Coordenadas, formatarEnderecoCompleto } from './formatadores';

/** Abre o painel de compartilhamento do sistema com um resumo da denúncia (caso de uso "Compartilhar Denúncia"). */
export async function compartilharDenuncia(denuncia: Denuncia): Promise<void> {
  const local = formatarEnderecoCompleto(denuncia.endereco);
  const { latitude, longitude } = denuncia.endereco;
  const linhas = [
    'Denúncia ambiental registrada no EcoTec',
    `${tituloDeExibicao(denuncia)} (${denuncia.categoria.nome})`,
    local ? `Local: ${local}` : null,
    `Situação: ${denuncia.status.rotulo}`,
    latitude !== undefined && longitude !== undefined
      ? `Mapa: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null,
  ].filter((linha): linha is string => !!linha);

  await Share.share({ message: linhas.join('\n') });
}

/** Abre o ponto no aplicativo de mapas do aparelho. */
export async function abrirNoMapa(ponto: Coordenadas, rotulo: string): Promise<void> {
  const coordenadas = `${ponto.latitude},${ponto.longitude}`;
  const nome = encodeURIComponent(rotulo);
  const web = `https://www.google.com/maps/search/?api=1&query=${coordenadas}`;
  const nativo = Platform.select({
    ios: `http://maps.apple.com/?ll=${coordenadas}&q=${nome}`,
    android: `geo:${coordenadas}?q=${coordenadas}(${nome})`,
    default: web,
  });
  try {
    await Linking.openURL(nativo);
  } catch {
    await Linking.openURL(web);
  }
}
