import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import React, { ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mensagemDeErro } from '../../api/cliente';
import { criarDenuncia } from '../../api/denuncias';
import type { DenunciaRequest } from '../../api/tipos';
import { Aviso } from '../../components/Aviso';
import { BarraStatus } from '../../components/BarraStatus';
import { Botao } from '../../components/Botao';
import { CabecalhoVerde } from '../../components/CabecalhoVerde';
import { Campo } from '../../components/Campo';
import { SecaoEvidencias } from '../../components/denuncia/SecaoEvidencias';
import { LocalDaDenuncia, LOCAL_VAZIO, SecaoLocal, SituacaoDoGps } from '../../components/denuncia/SecaoLocal';
import { SeletorDeCategoria } from '../../components/denuncia/SeletorDeCategoria';
import { FolhaDeAcoes } from '../../components/FolhaDeAcoes';
import { Icone, NomeIcone } from '../../components/Icone';
import { Mosaico } from '../../components/Mosaico';
import { Texto } from '../../components/Texto';
import { useLocalizacao } from '../../contexts/LocalizacaoContext';
import { useConexao } from '../../hooks/useConexao';
import { chaves } from '../../hooks/useDenuncias';
import { useEvidencias } from '../../hooks/useEvidencias';
import { TelaProps } from '../../navigation/tipos';
import { cores, espaco, raio } from '../../theme';
import { lerArquivoEmBase64 } from '../../utils/arquivos';
import { juntarTituloEDescricao } from '../../utils/denuncia';
import { apenasDigitos, Coordenadas, formatarTamanho } from '../../utils/formatadores';
import { limparBase64 } from '../../utils/fotos';
import { enderecoDoPonto } from '../../utils/geocodificacao';
import { capturarMosaico, QUADRO_DO_MOSAICO } from '../../utils/mosaico';
import { comTempoLimite } from '../../utils/tempo';
import { toqueDeSucesso } from '../../utils/vibrar';
import { LIMITES } from '../../utils/validacao';

/**
 * O servidor (Kestrel) aceita, por padrão, cerca de 28 MB por requisição.
 * Como foto e vídeo viajam em base64 dentro do JSON, o app confere o total antes de enviar.
 */
const LIMITE_DO_ENVIO = 28 * 1000 * 1000;

type Erros = {
  categoria?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  ponto?: string | null;
  estado?: string | null;
};

type Envio = { fase: 'preparando' | 'enviando'; progresso: number };

/**
 * Nova denúncia (RF04 a RF09).
 * Categoria, título, descrição, evidências (até 3 fotos e 1 vídeo) e local capturado pelo GPS.
 * A data e a hora são registradas pelo servidor no momento do envio.
 */
export function NovaDenunciaScreen({ navigation }: TelaProps<'NovaDenuncia'>) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { conectado } = useConexao();
  const { coordenadas: posicaoDoFeed } = useLocalizacao();
  const evidencias = useEvidencias();

  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);
  const posicoes = useRef({ oQue: 0, evidencias: 0, onde: 0 });
  const quadroDoMosaico = useRef<ComponentRef<typeof View>>(null);
  const mosaicoCarregado = useRef(false);
  const buscaDeEndereco = useRef(0);

  const [categoria, setCategoria] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ponto, setPonto] = useState<Coordenadas | null>(posicaoDoFeed);
  const [gps, setGps] = useState<SituacaoDoGps>('buscando');
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [local, setLocal] = useState<LocalDaDenuncia>(LOCAL_VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [falha, setFalha] = useState<string | null>(null);
  const [registrada, setRegistrada] = useState<number | null>(null);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const temPonto = useRef(false);
  temPonto.current = ponto !== null;

  const enviando = envio !== null;
  const fotosDoMosaico = evidencias.fotos.map((f) => f.uri);
  const assinaturaDoMosaico = fotosDoMosaico.join('|');

  useEffect(() => {
    mosaicoCarregado.current = false;
  }, [assinaturaDoMosaico]);

  // ---------- Local da ocorrência ----------

  /** Preenche o endereço a partir das coordenadas (geocodificação reversa). */
  const preencherEndereco = useCallback(async (alvo: Coordenadas) => {
    const pedido = ++buscaDeEndereco.current;
    setBuscandoEndereco(true);
    const achado = await enderecoDoPonto(alvo);
    if (pedido !== buscaDeEndereco.current) return; // já existe uma busca mais recente
    setBuscandoEndereco(false);
    if (achado) {
      setLocal((anterior) => ({ ...achado, pontoReferencia: anterior.pontoReferencia }));
      setErros((e) => (e.estado ? { ...e, estado: null } : e));
    }
  }, []);

  /** Captura a posição atual do aparelho com alta precisão (RF09). */
  const capturarLocal = useCallback(async () => {
    setGps('buscando');
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        setGps('negada');
        return;
      }
      const posicao = await comTempoLimite(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        20000,
      );
      const atual = { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };
      setPonto(atual);
      setGps('ok');
      setErros((e) => (e.ponto ? { ...e, ponto: null } : e));
      void preencherEndereco(atual);
    } catch {
      // Sem posição nova: se já havia um ponto (o do feed), ele continua valendo.
      setGps(temPonto.current ? 'ok' : 'erro');
    }
  }, [preencherEndereco]);

  useEffect(() => {
    if (posicaoDoFeed) void preencherEndereco(posicaoDoFeed); // resposta imediata com a posição já conhecida
    void capturarLocal();
    // Executa uma vez, ao abrir a tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aoMoverPonto = useCallback(
    (novo: Coordenadas) => {
      setPonto(novo);
      setGps('ok');
      void preencherEndereco(novo);
    },
    [preencherEndereco],
  );

  const aoMudarLocal = useCallback((campo: keyof LocalDaDenuncia, valor: string) => {
    buscaDeEndereco.current += 1; // o que o usuário digitar não é sobrescrito por uma busca em andamento
    setBuscandoEndereco(false);
    setLocal((anterior) => ({ ...anterior, [campo]: valor }));
    if (campo === 'estado') setErros((e) => (e.estado ? { ...e, estado: null } : e));
  }, []);

  // ---------- Saída ----------

  const temAlteracoes =
    categoria !== null ||
    titulo.trim().length > 0 ||
    descricao.trim().length > 0 ||
    evidencias.fotos.length > 0 ||
    evidencias.video !== null;

  const fechar = useCallback(() => {
    if (enviando) return;
    if (temAlteracoes && registrada === null) setConfirmandoSaida(true);
    else navigation.goBack();
  }, [enviando, temAlteracoes, registrada, navigation]);

  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      fechar();
      return true;
    });
    return () => assinatura.remove();
  }, [fechar]);

  // ---------- Envio ----------

  const validar = (): Erros => {
    const tituloLimpo = titulo.trim();
    const descricaoLimpa = descricao.trim();
    return {
      categoria: categoria === null ? 'Escolha a categoria que mais combina com a ocorrência.' : null,
      titulo:
        tituloLimpo.length === 0
          ? 'Dê um título curto para a denúncia.'
          : tituloLimpo.length < 5
            ? 'O título precisa ter pelo menos 5 caracteres.'
            : null,
      descricao:
        descricaoLimpa.length === 0
          ? 'Descreva o que aconteceu.'
          : descricaoLimpa.length < LIMITES.descricaoMin
            ? `Conte um pouco mais: a descrição precisa de pelo menos ${LIMITES.descricaoMin} caracteres.`
            : null,
      ponto: ponto ? null : 'Marque o local da ocorrência: toque em "Usar minha localização atual".',
      estado: local.estado.length > 0 && local.estado.length !== 2 ? 'Use a sigla, como SP.' : null,
    };
  };

  /** Uma foto vai como está; duas ou três viram um mosaico em uma única imagem. */
  const prepararImagem = async (): Promise<{ base64: string | null; mosaicoFalhou: boolean }> => {
    const { fotos } = evidencias;
    if (fotos.length === 0) return { base64: null, mosaicoFalhou: false };
    if (fotos.length === 1) return { base64: fotos[0].base64, mosaicoFalhou: false };

    // Espera as fotos do quadro terminarem de carregar (no máximo 2,5 s).
    for (let i = 0; i < 25 && !mosaicoCarregado.current; i++) {
      await new Promise((resolver) => setTimeout(resolver, 100));
    }
    const mosaico = await capturarMosaico(quadroDoMosaico, fotos.map((f) => f.uri));
    return mosaico ? { base64: mosaico, mosaicoFalhou: false } : { base64: fotos[0].base64, mosaicoFalhou: true };
  };

  const enviar = async () => {
    if (enviando) return;
    const novosErros = validar();
    setErros(novosErros);
    setFalha(null);

    if (novosErros.categoria || novosErros.titulo || novosErros.descricao) {
      rolagem.current?.scrollTo({ y: posicoes.current.oQue, animated: true });
      return;
    }
    if (novosErros.ponto || novosErros.estado) {
      rolagem.current?.scrollTo({ y: posicoes.current.onde, animated: true });
      return;
    }
    if (!conectado) {
      setFalha('Você está sem internet. Conecte-se para enviar a denúncia; o que você preencheu continua aqui.');
      return;
    }
    if (!ponto || categoria === null) return;

    setEnvio({ fase: 'preparando', progresso: 0 });
    try {
      const imagem = await prepararImagem();
      const video = evidencias.video ? limparBase64(await lerArquivoEmBase64(evidencias.video.uri)) : null;

      const tamanho = (imagem.base64?.length ?? 0) + (video?.length ?? 0);
      if (tamanho > LIMITE_DO_ENVIO) {
        setEnvio(null);
        setFalha(
          `As evidências somam ${formatarTamanho(tamanho)} no formato de envio, e o servidor aceita cerca de 28 MB por denúncia. Troque por um vídeo mais curto.`,
        );
        rolagem.current?.scrollTo({ y: posicoes.current.evidencias, animated: true });
        return;
      }

      const corpo: DenunciaRequest = {
        descricao: juntarTituloEDescricao(titulo, descricao),
        imagem: imagem.base64,
        video,
        idTipoDenuncia: categoria,
        endereco: {
          cep: local.cep.trim(),
          estado: local.estado.trim().toUpperCase(),
          cidade: local.cidade.trim(),
          bairro: local.bairro.trim(),
          rua: local.rua.trim(),
          numero: Number(apenasDigitos(local.numero)) || 0,
          pontoReferencia: local.pontoReferencia.trim(),
          latitude: Number(ponto.latitude.toFixed(7)),
          longitude: Number(ponto.longitude.toFixed(7)),
        },
      };

      setEnvio({ fase: 'enviando', progresso: 0 });
      const resposta = await criarDenuncia(corpo, (fracao) => setEnvio({ fase: 'enviando', progresso: fracao }));

      // Feed, mapa e histórico passam a mostrar a nova denúncia.
      await queryClient.invalidateQueries({ queryKey: chaves.denuncias });
      toqueDeSucesso();
      setEnvio(null);
      setRegistrada(resposta.id);
      if (imagem.mosaicoFalhou) {
        setFalha('Não foi possível juntar as fotos neste aparelho, então só a primeira foi enviada.');
      }
    } catch (erro) {
      setEnvio(null);
      setFalha(mensagemDeErro(erro));
    }
  };

  // ---------- Tela de confirmação ----------

  if (registrada !== null) {
    return (
      <View style={[estilos.tela, { paddingTop: insets.top, paddingBottom: insets.bottom + espaco.lg }]}>
        <BarraStatus estilo="dark" />
        <View style={estilos.sucesso}>
          <View style={estilos.seloSucesso}>
            <Icone nome="check-decagram" tamanho={54} cor={cores.folha} />
          </View>
          <Texto variante="destaque" centro accessibilityRole="header">
            Denúncia registrada
          </Texto>
          <View style={estilos.protocolo}>
            <Texto variante="apoio" cor={cores.tintaSuave}>
              Protocolo
            </Texto>
            <Texto variante="titulo" cor={cores.mata}>
              nº {registrada}
            </Texto>
          </View>
          <Texto variante="corpo" cor={cores.tintaSuave} centro style={{ maxWidth: 330 }}>
            Ela já aparece no feed da região. Acompanhe a situação em Minhas denúncias.
          </Texto>
          {falha ? (
            <Aviso tipo="alerta" style={{ alignSelf: 'stretch' }}>
              {falha}
            </Aviso>
          ) : null}
        </View>
        <View style={{ paddingHorizontal: espaco.xl, gap: espaco.sm }}>
          <Botao
            titulo="Ver a denúncia"
            onPress={() => navigation.replace('DetalheDenuncia', { id: registrada })}
            testID="nova-ver-denuncia"
          />
          <Botao titulo="Voltar ao início" variante="suave" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  // ---------- Formulário ----------

  return (
    <View style={estilos.tela}>
      <BarraStatus estilo="light" />

      {/*
        Quadro usado para montar o mosaico. Fica atrás do formulário (coberto por ele),
        mas dentro da tela, para que o sistema consiga transformá-lo em imagem.
      */}
      {evidencias.fotos.length >= 2 ? (
        <View style={estilos.quadroOculto} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Mosaico
            ref={quadroDoMosaico}
            fotos={fotosDoMosaico}
            largura={QUADRO_DO_MOSAICO.largura}
            altura={QUADRO_DO_MOSAICO.altura}
            aoCarregarTudo={() => {
              mosaicoCarregado.current = true;
            }}
          />
        </View>
      ) : null}

      <View style={estilos.frente}>
        <CabecalhoVerde
          titulo="Nova denúncia"
          subtitulo="Conte o que viu e onde foi"
          aoVoltar={fechar}
          iconeVoltar="close"
          rotuloVoltar="Fechar"
        />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={rolagem}
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View onLayout={(e) => (posicoes.current.oQue = e.nativeEvent.layout.y)}>
              <Secao icone="bullhorn-outline" titulo="O que aconteceu" />
              <Texto variante="apoioForte" style={{ marginBottom: espaco.xs }}>
                Categoria
              </Texto>
              <SeletorDeCategoria
                selecionada={categoria}
                aoSelecionar={(id) => {
                  setCategoria(id);
                  setErros((e) => ({ ...e, categoria: null }));
                }}
                erro={erros.categoria}
              />
              <View style={{ height: espaco.md }} />
              <Campo
                rotulo="Título"
                placeholder="Ex.: Entulho descartado na beira do córrego"
                value={titulo}
                onChangeText={(t) => {
                  setTitulo(t);
                  if (erros.titulo) setErros((e) => ({ ...e, titulo: null }));
                }}
                erro={erros.titulo}
                maxLength={LIMITES.titulo}
                editable={!enviando}
                returnKeyType="next"
                testID="nova-titulo"
              />
              <Campo
                rotulo="Descrição"
                placeholder="O que você viu? Desde quando acontece? Quem ou o que é afetado?"
                value={descricao}
                onChangeText={(t) => {
                  setDescricao(t);
                  if (erros.descricao) setErros((e) => ({ ...e, descricao: null }));
                }}
                erro={erros.descricao}
                ajuda={`${descricao.length} de ${LIMITES.descricao} caracteres`}
                multilinha
                maxLength={LIMITES.descricao}
                editable={!enviando}
                testID="nova-descricao"
              />
            </View>

            <View onLayout={(e) => (posicoes.current.evidencias = e.nativeEvent.layout.y)}>
              <Secao icone="camera-outline" titulo="Evidências" texto="Fotos e vídeo ajudam os órgãos ambientais a avaliar a ocorrência." />
              <SecaoEvidencias evidencias={evidencias} desabilitada={enviando} />
            </View>

            <View onLayout={(e) => (posicoes.current.onde = e.nativeEvent.layout.y)}>
              <Secao icone="map-marker-outline" titulo="Onde foi" />
              <SecaoLocal
                ponto={ponto}
                gps={gps}
                buscandoEndereco={buscandoEndereco}
                local={local}
                aoMudarLocal={aoMudarLocal}
                aoMoverPonto={aoMoverPonto}
                aoUsarMinhaLocalizacao={() => void capturarLocal()}
                erroDoPonto={erros.ponto}
                erroDoEstado={erros.estado}
                desabilitada={enviando}
              />
            </View>

            <View style={estilos.informacoes}>
              <Informacao icone="calendar-clock-outline" texto="A data e a hora são registradas automaticamente no envio." />
              <Informacao icone="account-group-outline" texto="A denúncia fica visível no feed da região, para quem está por perto." />
            </View>
          </ScrollView>

          <View style={[estilos.rodape, { paddingBottom: Math.max(insets.bottom, espaco.sm) }]}>
            {!conectado ? (
              <Aviso tipo="alerta" style={{ marginBottom: espaco.sm }}>
                Sem internet. O envio fica disponível quando a conexão voltar.
              </Aviso>
            ) : null}
            {falha ? (
              <Aviso tipo="erro" titulo="A denúncia não foi enviada" style={{ marginBottom: espaco.sm }}>
                {falha}
              </Aviso>
            ) : null}
            {envio ? (
              <View style={{ marginBottom: espaco.sm }} accessibilityLiveRegion="polite">
                <Texto variante="apoioForte" cor={cores.tintaSuave} style={{ marginBottom: 6 }}>
                  {envio.fase === 'preparando'
                    ? 'Preparando fotos e vídeo…'
                    : `Enviando a denúncia… ${Math.round(envio.progresso * 100)}%`}
                </Texto>
                <View
                  style={estilos.trilho}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(envio.progresso * 100) }}
                >
                  <View style={[estilos.barra, { width: `${Math.max(4, Math.round(envio.progresso * 100))}%` }]} />
                </View>
              </View>
            ) : null}
            <Botao
              titulo="Enviar denúncia"
              icone="bullhorn-outline"
              onPress={() => void enviar()}
              carregando={enviando}
              desabilitado={!conectado || evidencias.processando}
              testID="nova-enviar"
            />
          </View>
        </KeyboardAvoidingView>
      </View>

      <FolhaDeAcoes
        visivel={confirmandoSaida}
        titulo="Descartar esta denúncia?"
        texto="O que você preencheu será perdido."
        aoFechar={() => setConfirmandoSaida(false)}
        rotuloCancelar="Continuar preenchendo"
        acoes={[{ titulo: 'Descartar denúncia', icone: 'trash-can-outline', perigo: true, onPress: () => navigation.goBack() }]}
      />
    </View>
  );
}

function Secao({ icone, titulo, texto }: { icone: NomeIcone; titulo: string; texto?: string }) {
  return (
    <View style={estilos.secao}>
      <View style={estilos.tituloSecao}>
        <Icone nome={icone} tamanho={22} cor={cores.folha} />
        <Texto variante="titulo" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 26 }}>
          {titulo}
        </Texto>
      </View>
      {texto ? (
        <Texto variante="apoio" cor={cores.tintaSuave} style={{ marginTop: 4 }}>
          {texto}
        </Texto>
      ) : null}
    </View>
  );
}

function Informacao({ icone, texto }: { icone: NomeIcone; texto: string }) {
  return (
    <View style={estilos.informacao}>
      <Icone nome={icone} tamanho={20} cor={cores.tintaSuave} />
      <Texto variante="apoio" cor={cores.tintaSuave} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  quadroOculto: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  frente: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  conteudo: {
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.xl,
  },
  secao: {
    marginTop: espaco.xl,
    marginBottom: espaco.md,
  },
  tituloSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  informacoes: {
    marginTop: espaco.md,
    gap: espaco.xs,
    backgroundColor: cores.nevoa,
    borderRadius: raio.md,
    padding: espaco.sm,
  },
  informacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.xs,
  },
  rodape: {
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.sm,
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
  },
  trilho: {
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.orvalho,
    overflow: 'hidden',
  },
  barra: {
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.folha,
  },
  sucesso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.xl,
  },
  seloSucesso: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: cores.orvalho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolo: {
    alignItems: 'center',
    backgroundColor: cores.nevoa,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: raio.lg,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.xl,
  },
});
