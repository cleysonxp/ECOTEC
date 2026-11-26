# EcoTec - como rodar e testar o aplicativo

Este guia leva do zero até o app aberto no celular, conversando com o back-end, e traz o roteiro dos testes do TCC (Tabela 4).

- [1. O que você precisa](#1-o-que-você-precisa)
- [2. Ligar o back-end](#2-ligar-o-back-end)
- [3. Ligar o aplicativo](#3-ligar-o-aplicativo)
- [4. Roteiro de testes](#4-roteiro-de-testes)
- [5. Testar as telas sem o back-end (API simulada)](#5-testar-as-telas-sem-o-back-end-api-simulada)
- [6. Problemas comuns](#6-problemas-comuns)
- [7. O que a API atual ainda não oferece](#7-o-que-a-api-atual-ainda-não-oferece)

---

## 1. O que você precisa

| Item | Observação |
|---|---|
| Node.js 20.19 ou mais novo (recomendado: 22 LTS) | confira com `node -v` |
| .NET SDK 8 e MySQL | para o back-end (pasta `BackEnd/EcoTec`) |
| Celular com **Expo Go para o SDK 54** | veja o aviso abaixo |
| Celular e computador no **mesmo Wi-Fi** | redes de visitantes costumam bloquear a comunicação entre aparelhos |

> **Atenção à versão do Expo Go.** O projeto usa o Expo SDK 54 e o Expo Go só abre projetos do mesmo SDK dele.
> No Expo Go, toque em **Settings** e confira **Supported SDK** no fim da tela.
>
> - **iPhone:** enquanto o seu Expo Go mostrar SDK 54, **não o atualize** até a apresentação. Para evitar a atualização automática: Ajustes > App Store > desligue "Atualizações de Apps".
> - **Android:** se o Expo Go da Play Store estiver em um SDK mais novo, instale a versão do SDK 54 em <https://expo.dev/go>.
> - Se o Expo Go já estiver em um SDK mais novo e não der para voltar, veja ["O projeto é incompatível com esta versão do Expo Go"](#o-projeto-é-incompatível-com-esta-versão-do-expo-go).

---

## 2. Ligar o back-end

O back-end não precisa de nenhuma alteração. A única diferença é **como iniciar**: por padrão ele só aceita conexões do próprio computador (`localhost`), e o celular precisa alcançá-lo pela rede.

1. Deixe o MySQL rodando e confira usuário e senha em `BackEnd/EcoTec/EcoTec/appsettings.json` (`ConnectionStrings:DefaultConnection`).

2. Se o banco `EcoTec` ainda não existir, crie as tabelas (na pasta `BackEnd/EcoTec`):

   ```bash
   dotnet ef database update --project EcoTec.Infra --startup-project EcoTec
   ```

3. Inicie a API escutando na rede (na pasta `BackEnd/EcoTec/EcoTec`):

   ```bash
   dotnet run --urls "http://0.0.0.0:5260"
   ```

   O `--urls` vale só para essa execução; nenhum arquivo do back-end é modificado.

4. Descubra o IP do computador no Wi-Fi:

   - Windows: `ipconfig` e procure "Endereço IPv4" (algo como `192.168.0.10`)
   - macOS/Linux: `ipconfig getifaddr en0` ou `hostname -I`

5. **Teste pelo navegador do celular:** abra `http://SEU-IP:5260/swagger`. Se o Swagger aparecer, o celular alcança a API.

   Se não abrir, quase sempre é o firewall do Windows. Libere a porta (PowerShell como administrador):

   ```powershell
   New-NetFirewallRule -DisplayName "EcoTec API 5260" -Direction Inbound -Protocol TCP -LocalPort 5260 -Action Allow -Profile Private
   ```

---

## 3. Ligar o aplicativo

Na pasta `FrontEnd`:

```bash
npm install
npx expo start
```

- **iPhone:** abra a câmera, aponte para o QR code e toque no aviso para abrir no Expo Go.
- **Android:** abra o Expo Go e toque em "Scan QR code".

Na primeira abertura o app demora um pouco mais, porque o pacote é montado e enviado ao celular.

### Endereço da API

Você não precisa configurar nada quando o back-end e o Expo rodam **no mesmo computador**: o app usa o IP desse computador na porta 5260. O endereço em uso aparece no rodapé da tela de login ("Servidor: ...").

Para usar outro endereço, escolha uma das opções:

- **Pelo app:** toque em "Servidor: ..." na tela de login (ou Perfil > Conexão com o servidor), digite o endereço, toque em **Testar conexão** e em **Salvar endereço**.
- **Pelo arquivo `.env`:** copie `.env.example` para `.env`, preencha `EXPO_PUBLIC_API_URL=http://SEU-IP:5260` e reinicie com `npx expo start -c`.

---

## 4. Roteiro de testes

Os dez primeiros itens seguem os casos de teste da Tabela 4 do TCC. Faça na ordem: cada passo usa o resultado do anterior.

| Nº | Caso de teste | O que fazer no app | Resultado esperado |
|---|---|---|---|
| 1 | Cadastro de usuário | Login > **Criar conta**. Preencha nome, e-mail, senha e confirmação, marque o aceite e toque em **Continuar** | Vai para a etapa 2. Campos vazios ou inválidos mostram a mensagem embaixo de cada um |
| 2 | Registro de endereço | Digite o CEP (o restante é preenchido), confira e toque em **Criar conta** | Entra no app com o aviso "Conta criada". Em **Perfil**, o endereço aparece em "Meu endereço" |
| 3 | Login com credenciais válidas | Perfil > **Sair da conta**. Entre com o e-mail e a senha cadastrados | Abre o feed "Denúncias perto de você" |
| 4 | Login com credenciais inválidas | Saia e tente entrar com a senha errada | Mensagem "E-mail ou senha incorretos" e o app continua no login |
| 5 | Acesso a rotas protegidas | Sem entrar, as telas internas não existem. Para ver a expiração: fique com o app aberto mais de 2 horas (validade do token) e atualize o feed | O app volta ao login com o aviso "Sua sessão expirou" |
| 6 | Consulta por localização | Em **Início**, permita a localização. Troque o raio (2, 5, 10, 25, 50 km) e abra a aba **Mapa** | A lista e o mapa mostram só as denúncias dentro do raio, com a distância de cada uma |
| 7 | Criação de denúncia | Toque em **Denunciar**. Escolha a categoria, escreva título e descrição, adicione fotos (até 3) e, se quiser, um vídeo. Confira o ponto no mapa e toque em **Enviar denúncia** | Tela "Denúncia registrada" com o número do protocolo. A denúncia aparece no feed e no mapa |
| 8 | Consulta por usuário | Abra a aba **Minhas** | Lista só as suas denúncias, com data, endereço e situação. Os filtros separam por situação |
| 9 | Registro de curtida | No feed, toque no coração de uma denúncia | O coração fica verde e o total sobe 1. Tocar de novo não soma duas vezes |
| 10 | Remoção de curtida | Toque de novo no coração | O coração volta ao contorno e o total desce 1 |

Verificações complementares:

| Nº | O que fazer | Resultado esperado | Requisito |
|---|---|---|---|
| 11 | No feed, toque em **Ver detalhes** | Foto (toque para ampliar), situação em três etapas, descrição, endereço, mapa e protocolo | RF11 |
| 12 | Na nova denúncia, adicione 2 ou 3 fotos | Aparece a prévia do mosaico; depois do envio, a denúncia mostra as fotos juntas em uma imagem | RF05 |
| 13 | Tente anexar um vídeo longo, com mais de 30 MB (no iPhone a galeria já reduz o vídeo; use um de vários minutos) | Mensagem informando o tamanho e o limite; o vídeo não é anexado | RF06, RNF08 |
| 14 | Na nova denúncia, toque no mapa em outro ponto | O marcador muda e o endereço é atualizado | RF09 |
| 15 | Toque em **Enviar denúncia** com tudo vazio | Mensagens em categoria, título e descrição; nada é enviado | RF04 |
| 16 | Ative o modo avião | Aviso "Sem conexão com a internet" no topo; o botão de enviar denúncia fica desabilitado | RNF10 |
| 17 | Negue a permissão de localização | O feed explica por que precisa da localização e oferece o botão para permitir ou abrir os ajustes | RF03 |
| 18 | No detalhe, toque em **Compartilhar** | Abre o painel de compartilhamento do sistema com o resumo da denúncia | caso de uso "Compartilhar Denúncia" |
| 19 | Feche o app e abra de novo (antes de 2 horas) | Continua na sua conta, sem pedir login | - |
| 20 | No login, toque em **Esqueci minha senha** e envie um e-mail | Aviso de que a recuperação por e-mail ainda não está disponível | ver item 7 |

Para o capítulo de resultados, tire as capturas de tela durante esses passos, já com os dados reais do back-end.

---

## 5. Testar as telas sem o back-end (API simulada)

Para validar as telas quando o .NET ou o MySQL não estiverem à mão, a pasta `scripts` tem uma **API simulada**: um programa pequeno em Node que responde nas mesmas rotas e com os mesmos formatos do back-end, guardando tudo só na memória.

```bash
npm run api:simulada
```

- Usa a porta 5260, a mesma do back-end. **Não rode os dois ao mesmo tempo.**
- Usuário de exemplo: `ana@ecotec.app`, senha `ecotec123`. Também dá para criar contas.
- Já vem com seis denúncias de exemplo, posicionadas em volta de quem fizer a primeira consulta, com ilustrações no lugar das fotos.
- Ao encerrar (Ctrl + C), os dados somem.

> A API simulada serve para conferir telas e fluxos. Os testes do TCC devem ser feitos com o back-end real.

### Pré-visualização no navegador (opcional)

```bash
npx expo start --web
```

Abre o app no navegador, útil para olhar o layout rapidamente. Só funciona com a **API simulada**, porque o back-end real não libera chamadas vindas do navegador (CORS). Na web o mapa é ilustrativo e câmera, vibração e armazenamento seguro não existem.

---

## 6. Problemas comuns

### "O projeto é incompatível com esta versão do Expo Go"

O Expo Go do celular é de um SDK diferente do projeto (SDK 54).

- **Android:** instale o Expo Go do SDK 54 em <https://expo.dev/go>.
- **iPhone:** não dá para voltar a versão do Expo Go. Nesse caso, atualize o projeto para o SDK mostrado em "Supported SDK" (troque o `58` abaixo pelo número do seu Expo Go):

  ```bash
  npx expo install expo@^58.0.0 --fix
  npx expo-doctor
  npx expo start -c
  ```

  Em um ensaio feito com o SDK 58, o projeto passou na verificação de tipos e gerou o pacote do iOS sem mudanças no código. Mesmo assim, depois de atualizar, percorra o roteiro do item 4 antes da apresentação e confira as notas da versão em <https://expo.dev/changelog>.

### "Não foi possível falar com o servidor"

1. O back-end foi iniciado com `--urls "http://0.0.0.0:5260"`?
2. `http://SEU-IP:5260/swagger` abre no navegador do celular? Se não abrir, é rede ou firewall (item 2 deste guia).
3. O celular está no mesmo Wi-Fi do computador (e não no 4G)?
4. O IP do computador mudou? Confira em "Servidor: ..." na tela de login e use **Testar conexão**.
5. No iPhone, o Expo Go precisa da permissão de **Rede local** (Ajustes > Expo Go).

### O QR code não abre ou fica carregando

- Confirme o mesmo Wi-Fi. Em redes que isolam os aparelhos, use `npx expo start --tunnel`.
- Com `--tunnel`, a detecção automática do endereço da API não funciona: informe o endereço na tela "Conexão com o servidor".
- Limpe o cache: `npx expo start -c`.

### Erro ao enviar denúncia com vídeo

- Mensagem de arquivo grande demais: o servidor aceita cerca de 28 MB por requisição, e o vídeo cresce um terço ao ser convertido para envio. Use um vídeo de até uns 20 MB.
- "O servidor encontrou um problema": pode ser o limite de pacote do MySQL (`max_allowed_packet`). No MySQL 8 o padrão é 64 MB; em instalações com MariaDB/XAMPP costuma ser bem menor.
- O feed traz as fotos e os vídeos de todas as denúncias na mesma resposta. Muitos vídeos deixam o carregamento lento; nas demonstrações, prefira vídeos curtos.

### O feed está vazio

Não há denúncias dentro do raio escolhido. Aumente o raio ou registre uma denúncia: ela usa a sua posição atual e aparece em seguida.

### A sessão caiu

O token do back-end vale 2 horas. Depois disso o app pede o login de novo; é o comportamento esperado.

---

## 7. O que a API atual ainda não oferece

O back-end não foi alterado. Estes pontos da documentação dependem dele:

| Ponto | Situação na API | Como o app trata |
|---|---|---|
| Recuperação de senha por e-mail | não há rota | a tela existe e informa que o envio ainda não está disponível |
| Publicar ou não no feed regional (RF07) | a denúncia não tem esse campo | o formulário informa que a denúncia fica visível no feed |
| Envio aos órgãos ambientais (RF08) | não implementado | não aparece no app |
| Mais de uma foto por denúncia (RF05) | um campo de imagem | o app junta até 3 fotos em um mosaico |
| Vídeo de 30 MB (RF06) | o servidor aceita cerca de 28 MB por requisição | o app valida os 30 MB e confere o total antes do envio |
| Troca de senha | `PUT /usuario/{id}` grava a senha sem hash, o que impede o login seguinte | o app não usa essa rota |
| E-mail repetido no cadastro | `POST /usuario` não verifica | o app não tem como verificar antes do envio |
