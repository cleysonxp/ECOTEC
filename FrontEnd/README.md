<p align="center">
  <img src="assets/logo-horizontal.png" alt="EcoTec - Monitoramento ambiental cidadão" width="440">
</p>

# EcoTec - aplicativo móvel (front-end)

Aplicativo em React Native (Expo) do TCC **"EcoTec: o cidadão paulista na linha de frente do monitoramento ambiental"** (Sistemas de Informação, UNIP).

O cidadão registra uma denúncia ambiental com fotos, vídeo e a localização do GPS, vê as denúncias da sua região em um feed e em um mapa, e acompanha a situação de cada registro.

O app consome a API em ASP.NET Core que fica em [`../BackEnd/EcoTec`](../BackEnd/EcoTec).

- Passo a passo para rodar e testar: **[README_TESTES.md](README_TESTES.md)**

---

## Telas

| Tela | O que o usuário faz | Rotas da API | Requisitos |
|---|---|---|---|
| Login | Entra com e-mail e senha; vê o erro quando as credenciais não conferem | `POST /auth/login` | RF02 |
| Criar conta (2 etapas) | Informa nome, e-mail, senha e aceita o tratamento de dados; depois informa o endereço (o CEP preenche o resto) | `POST /usuario`, `POST /auth/login`, `POST /endereco` | RF01, RNF07 |
| Recuperar senha | Informa o e-mail da conta | *sem rota na API (ver limitações)* | - |
| Início (feed) | Vê as denúncias dentro do raio escolhido, curte, compartilha e abre os detalhes | `GET /denuncia?latitude&longitude&raioKm`, `POST` e `DELETE /denuncia/{id}/like` | RF03, RF11, RNF01 |
| Mapa | Vê as mesmas denúncias posicionadas no mapa, com cor por situação | `GET /denuncia?latitude&longitude&raioKm` | RF03, RF09 |
| Nova denúncia | Escolhe a categoria, escreve título e descrição, anexa até 3 fotos e 1 vídeo e confirma o local | `POST /denuncia` | RF04, RF05, RF06, RF09, RNF08, RNF10 |
| Detalhe da denúncia | Vê foto, vídeo, situação, descrição, endereço e mapa; curte e compartilha | `GET /denuncia/{id}` | RF11 |
| Minhas denúncias | Vê o histórico dos próprios registros e filtra por situação | `GET /denuncia/minhasDenuncias` | RF10 |
| Perfil | Vê seus dados, o endereço e o resumo da participação; sai da conta | `GET /endereco/{idUsuario}`, `POST /endereco` | RF01 |
| Privacidade e dados | Lê, em linguagem simples, o que é coletado e para quê | - | RNF07 |
| Conexão com o servidor | Confere e troca o endereço da API (apoio aos testes) | - | - |

## Tecnologias

| Para quê | Biblioteca |
|---|---|
| Base | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| Navegação | React Navigation 7 (pilha nativa + abas inferiores) |
| Chamadas à API | **axios** (cliente único, com interceptadores para o token JWT e para os erros) |
| Cache e estado dos dados do servidor | TanStack Query (React Query) |
| Sessão | expo-secure-store (token JWT guardado no Keychain/Keystore) |
| Localização e mapa | expo-location, react-native-maps |
| Fotos e vídeo | expo-image-picker, expo-image-manipulator, react-native-view-shot, expo-video, expo-file-system |
| Conexão com a internet | @react-native-community/netinfo |
| Ícones e fontes | @expo/vector-icons, Sora e Atkinson Hyperlegible Next (Google Fonts) |

Todas as bibliotecas nativas usadas já vêm dentro do **Expo Go**. Não é preciso gerar build.

## Como rodar (resumo)

```bash
# 1. Back-end escutando na rede (em BackEnd/EcoTec/EcoTec)
dotnet run --urls "http://0.0.0.0:5260"

# 2. Aplicativo (nesta pasta)
npm install
npx expo start
```

Leia o QR code com a câmera do iPhone (ou com o Expo Go no Android). Celular e computador precisam estar no mesmo Wi-Fi.

O app descobre sozinho o endereço da API: usa o IP do computador que está rodando o Expo, na porta 5260. Para usar outro endereço, veja o [README_TESTES.md](README_TESTES.md).

## Como a integração com a API está organizada

```
src/api/
├── cliente.ts        cliente axios: token JWT, tempo limite e tradução dos erros
├── configuracao.ts   endereço da API (detecção automática, .env ou tela "Conexão")
├── tipos.ts          contratos de cada rota, iguais aos do back-end
├── autenticacao.ts   POST /auth/login e POST /usuario
├── enderecos.ts      GET /endereco/{idUsuario} e POST /endereco
├── denuncias.ts      todas as rotas de /denuncia
└── cep.ts            consulta ao ViaCEP (preenche o endereço pelo CEP)
```

- Depois do login, toda requisição leva o cabeçalho `Authorization: Bearer <token>`.
- Se o servidor responde 401 com a sessão em uso (o token vale 2 horas), o app encerra a sessão e volta ao login com um aviso.
- Fotos e vídeo seguem em base64 dentro do JSON, porque os campos `Imagem` e `Video` do back-end são `byte[]`.

## Estrutura de pastas

```
FrontEnd/
├── App.tsx                 fontes, provedores e navegação
├── app.json                configuração do Expo (nome, ícone, tela de abertura, permissões)
├── assets/                 logo, ícone e tela de abertura
├── scripts/                API simulada para testes sem o back-end
└── src/
    ├── api/                chamadas HTTP (ver acima)
    ├── components/         componentes reutilizáveis (botão, campo, cartão, mapa, mosaico...)
    ├── contexts/           sessão, localização, curtidas e avisos
    ├── hooks/              consultas à API e evidências (fotos e vídeo)
    ├── navigation/         pilha principal e abas
    ├── screens/            telas, por área (auth, feed, denuncia, historico, perfil)
    ├── theme/              cores, tipografia e espaçamentos
    └── utils/              validações, formatações, categorias e situações
```

## Identidade visual

- **Símbolo:** um marcador de mapa que também é uma folha. As nervuras terminam em pontos de circuito: localização, meio ambiente e tecnologia em um desenho só.
- **Curvas de nível:** o fundo dos cabeçalhos usa linhas de carta topográfica, que remetem a território e geolocalização.
- **Cores:** verde e branco.

| Nome no código | Cor | Uso |
|---|---|---|
| `mata` | `#0B3B2C` | cabeçalhos e títulos |
| `folha` | `#0F6B45` | botões e ações (contraste 6,5:1 com branco) |
| `broto` | `#2FBF74` | destaques sobre o verde escuro |
| `menta` | `#BFF0D2` | textos sobre o verde escuro |
| `orvalho` | `#EAF5EE` | superfícies suaves |
| `branco` | `#FFFFFF` | fundo dos formulários e cartões |

- **Tipografia:** Sora nos títulos e Atkinson Hyperlegible Next nos textos. A segunda foi criada pelo Braille Institute para facilitar a leitura por pessoas com baixa visão (RNF04).
- **Acessibilidade:** todos os botões têm rótulo para leitores de tela, as áreas de toque têm pelo menos 44 pt e os erros de formulário aparecem em texto, não só em cor.

## Decisões tomadas por causa da API atual

O back-end não foi alterado. Onde a documentação pede algo que a API ainda não oferece, o app faz o seguinte:

| Assunto | O que a API oferece | O que o app faz |
|---|---|---|
| Até 3 fotos (RF05) | um campo de imagem por denúncia | junta as fotos em um mosaico e envia como uma imagem só |
| Título da denúncia | só o campo `Descricao` | grava o título na primeira linha da descrição e separa de novo ao exibir |
| Vídeo de até 30 MB (RF06) | campo `Video`; o servidor aceita cerca de 28 MB por requisição | valida formato e os 30 MB; confere o total antes de enviar e avisa se passar do que o servidor aceita |
| Saber se o usuário já curtiu | só o total de curtidas | guarda as curtidas no aparelho e se corrige com as respostas 400/404 do servidor |
| Categorias | não há rota para listar | lista fixa com os mesmos IDs da migration `SeedTipoDenuncia` |
| Publicar ou não no feed (RF07) | não há esse campo | informa que a denúncia fica visível no feed da região |
| Recuperar senha por e-mail | não há rota | a tela existe e avisa que o envio ainda não está disponível |
| Envio aos órgãos ambientais (RF08) | não implementado | fora do app; depende do back-end |
| Trocar a senha | `PUT /usuario/{id}` grava a senha sem hash | o app **não** usa essa rota, para não bloquear a conta do usuário |

## Equipe

Bianca Camilly Pestana Rua, Cleyson Aparecido Ribeiro Soares, Vitor dos Santos Lima e Wesley Santos de Oliveira.
Universidade Paulista (UNIP) - Sistemas de Informação.
