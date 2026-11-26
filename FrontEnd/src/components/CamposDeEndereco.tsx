import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { consultarCep } from '../api/cep';
import { cores, espaco } from '../theme';
import { apenasDigitos, mascararCep } from '../utils/formatadores';
import { LIMITES, validarCep, validarObrigatorio, validarUf } from '../utils/validacao';
import { Campo } from './Campo';
import { Icone } from './Icone';

export type Endereco = { cep: string; estado: string; cidade: string; bairro: string; rua: string };
export type ErrosDeEndereco = Partial<Record<keyof Endereco, string | null>>;

export const ENDERECO_VAZIO: Endereco = { cep: '', estado: '', cidade: '', bairro: '', rua: '' };

export function validarEndereco(endereco: Endereco): ErrosDeEndereco {
  return {
    cep: validarCep(endereco.cep),
    rua: validarObrigatorio(endereco.rua, 'Informe a rua.'),
    bairro: validarObrigatorio(endereco.bairro, 'Informe o bairro.'),
    cidade: validarObrigatorio(endereco.cidade, 'Informe a cidade.'),
    estado: validarUf(endereco.estado),
  };
}

export const temErro = (erros: Record<string, string | null | undefined>) => Object.values(erros).some((e) => !!e);

type Props = {
  valor: Endereco;
  aoMudar: (endereco: Endereco) => void;
  erros: ErrosDeEndereco;
  aoLimparErro: (campo: keyof Endereco) => void;
};

/**
 * Campos de endereço do usuário (CEP, rua, bairro, cidade e estado).
 * Ao completar o CEP, o restante é preenchido automaticamente pelo ViaCEP.
 */
export function CamposDeEndereco({ valor, aoMudar, erros, aoLimparErro }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [situacaoCep, setSituacaoCep] = useState<'nenhuma' | 'achado' | 'naoAchado'>('nenhuma');
  const ultimoCepConsultado = useRef('');
  const valorAtual = useRef(valor);
  valorAtual.current = valor;

  const mudar = (campo: keyof Endereco, texto: string) => {
    aoMudar({ ...valorAtual.current, [campo]: texto });
    if (erros[campo]) aoLimparErro(campo);
  };

  const aoDigitarCep = useCallback(
    async (texto: string) => {
      const mascarado = mascararCep(texto);
      aoMudar({ ...valorAtual.current, cep: mascarado });
      if (erros.cep) aoLimparErro('cep');

      const digitos = apenasDigitos(mascarado);
      if (digitos.length !== 8) {
        setSituacaoCep('nenhuma');
        return;
      }
      if (digitos === ultimoCepConsultado.current) return;
      ultimoCepConsultado.current = digitos;

      setBuscando(true);
      const achado = await consultarCep(digitos);
      setBuscando(false);
      if (apenasDigitos(valorAtual.current.cep) !== digitos) return; // o usuário já mudou o CEP

      if (achado) {
        setSituacaoCep('achado');
        aoMudar({
          cep: mascarado,
          estado: achado.estado || valorAtual.current.estado,
          cidade: achado.cidade || valorAtual.current.cidade,
          bairro: achado.bairro || valorAtual.current.bairro,
          rua: achado.rua || valorAtual.current.rua,
        });
        (['estado', 'cidade', 'bairro', 'rua'] as const).forEach(aoLimparErro);
      } else {
        setSituacaoCep('naoAchado');
      }
    },
    [aoMudar, aoLimparErro, erros.cep],
  );

  return (
    <View>
      <Campo
        rotulo="CEP"
        icone="map-marker-outline"
        placeholder="00000-000"
        value={valor.cep}
        onChangeText={aoDigitarCep}
        erro={erros.cep}
        ajuda={
          situacaoCep === 'achado'
            ? 'Endereço preenchido pelo CEP. Confira e ajuste se precisar.'
            : situacaoCep === 'naoAchado'
              ? 'Não encontramos esse CEP. Preencha o endereço abaixo.'
              : 'Digite o CEP para preencher o endereço automaticamente.'
        }
        keyboardType="number-pad"
        maxLength={9}
        autoComplete="postal-code"
        textContentType="postalCode"
        direita={
          buscando ? (
            <ActivityIndicator color={cores.folha} accessibilityLabel="Consultando o CEP" />
          ) : situacaoCep === 'achado' ? (
            <Icone nome="check-circle-outline" tamanho={22} cor={cores.folha} />
          ) : undefined
        }
        testID="endereco-cep"
      />
      <Campo
        rotulo="Rua"
        placeholder="Nome da rua ou avenida"
        value={valor.rua}
        onChangeText={(t) => mudar('rua', t)}
        erro={erros.rua}
        autoCapitalize="words"
        maxLength={LIMITES.endereco}
        autoComplete="street-address"
        testID="endereco-rua"
      />
      <Campo
        rotulo="Bairro"
        placeholder="Seu bairro"
        value={valor.bairro}
        onChangeText={(t) => mudar('bairro', t)}
        erro={erros.bairro}
        autoCapitalize="words"
        maxLength={LIMITES.endereco}
        testID="endereco-bairro"
      />
      <View style={estilos.linha}>
        <View style={{ flex: 1 }}>
          <Campo
            rotulo="Cidade"
            placeholder="Sua cidade"
            value={valor.cidade}
            onChangeText={(t) => mudar('cidade', t)}
            erro={erros.cidade}
            autoCapitalize="words"
            maxLength={LIMITES.endereco}
            testID="endereco-cidade"
          />
        </View>
        <View style={{ width: 96 }}>
          <Campo
            rotulo="Estado"
            placeholder="SP"
            value={valor.estado}
            onChangeText={(t) => mudar('estado', t.replace(/[^A-Za-z]/g, '').toUpperCase())}
            erro={erros.estado}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={2}
            testID="endereco-estado"
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
});
