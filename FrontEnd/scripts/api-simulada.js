#!/usr/bin/env node
/**
 * API simulada do EcoTec - apenas para testar e demonstrar o aplicativo.
 *
 * Responde nas mesmas rotas, com os mesmos formatos e códigos HTTP do back-end real
 * (ASP.NET Core, pasta BackEnd/EcoTec), mas guarda tudo na memória: ao encerrar, os dados somem.
 * Não substitui o back-end: serve para validar as telas quando o .NET e o MySQL não estão disponíveis.
 *
 * Uso:   node scripts/api-simulada.js          (porta 5260, a mesma do back-end)
 *        PORT=5261 node scripts/api-simulada.js
 *
 * Usuário de exemplo:  ana@ecotec.app  /  ecotec123
 */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORTA = Number(process.env.PORT || 5260);
const SEGREDO = 'EcoTec-API-simulada-chave-apenas-para-testes';
const LIMITE_DO_CORPO = 30000000; // mesmo limite padrão do Kestrel (30.000.000 bytes)
const VALIDADE_DO_TOKEN_S = Number(process.env.TOKEN_SEGUNDOS || 2 * 60 * 60); // 2 horas, como no back-end

// ------------------------------------------------------------------ dados em memória

const TIPOS = {
  1: 'Desmatamento e queimadas',
  2: 'Poluição da água',
  3: 'Acúmulo e descarte irregular de lixo',
  4: 'Crimes contra animais e vida selvagem',
  5: 'Construções irregulares em áreas protegidas',
  6: 'Poluição do ar nas áreas urbanas',
  7: 'Outros',
};

const hash = (senha) => crypto.createHash('sha256').update(String(senha)).digest('hex');

const banco = {
  usuarios: [],
  enderecos: [],
  denuncias: [],
  likes: [], // { idUsuario, idDenuncia }
  proximoUsuario: 1,
  proximoEndereco: 1,
  proximaDenuncia: 1,
};

function novoUsuario(nome, email, senha) {
  const usuario = { idUsuario: banco.proximoUsuario++, nome, email, senhaHash: hash(senha) };
  banco.usuarios.push(usuario);
  return usuario;
}

function imagem(nome) {
  try {
    return fs.readFileSync(path.join(__dirname, 'api-simulada-imagens', nome)).toString('base64');
  } catch {
    return null;
  }
}

/** Data local sem fuso, como o back-end devolve (DateTime lido do MySQL). */
function dataLocal(data) {
  const p = (n, t = 2) => String(n).padStart(t, '0');
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}:${p(data.getSeconds())}.${p(data.getMilliseconds(), 3)}`;
}

// Denúncias de exemplo, posicionadas em volta de um ponto de referência (norte/leste em km).
const EXEMPLOS = [
  {
    autor: 2, tipo: 2, status: [1, 'Em análise'], horasAtras: 2, norte: 0.6, leste: -0.4, likes: [3, 4, 5],
    descricao: 'Espuma e lixo no córrego atrás da escola\nDesde ontem o córrego está coberto de espuma branca e há sacos de lixo presos na margem. O cheiro é forte e chega até as casas da rua.',
    imagem: 'corrego.jpg', rua: 'Rua das Palmeiras', numero: 210, bairro: 'Jardim das Flores', ponto: 'Atrás da escola municipal',
  },
  {
    autor: 3, tipo: 3, status: [1, 'Em análise'], horasAtras: 7, norte: -1.1, leste: 0.9, likes: [2, 4],
    descricao: 'Entulho descartado em terreno baldio\nUm caminhão vem despejando restos de obra e móveis velhos no terreno da esquina há pelo menos duas semanas.',
    imagem: 'entulho.jpg', rua: 'Avenida Tenente Marques', numero: 1450, bairro: 'Fazendinha', ponto: 'Esquina com a Rua Sete',
  },
  {
    autor: 4, tipo: 1, status: [2, 'Resolvida'], horasAtras: 30, norte: 2.4, leste: 1.8, likes: [2, 3, 5, 1],
    descricao: 'Queimada em área de mata\nFogo em vegetação na encosta, com muita fumaça. Os bombeiros foram acionados e o fogo foi controlado.',
    imagem: 'queimada.jpg', rua: 'Estrada dos Romeiros', numero: 0, bairro: 'Cururuquara', ponto: 'Próximo ao km 38',
  },
  {
    autor: 5, tipo: 6, status: [0, 'Recebida'], horasAtras: 52, norte: -3.2, leste: -2.6, likes: [],
    descricao: 'Fumaça escura saindo de chaminé todas as noites\nA fumaça começa por volta das 22h e deixa fuligem nos carros e nas janelas do bairro.',
    imagem: 'fumaca.jpg', rua: 'Rua do Progresso', numero: 88, bairro: 'Parque Industrial', ponto: '',
  },
  {
    autor: 2, tipo: 4, status: [1, 'Em análise'], horasAtras: 80, norte: 6.5, leste: -5.2, likes: [3],
    descricao: 'Armadilhas para pássaros em área verde\nEncontrei gaiolas e alçapões montados na trilha da mata, perto da nascente.',
    imagem: null, rua: 'Trilha da Nascente', numero: 0, bairro: 'Suru', ponto: 'Entrada pela Rua dos Ipês',
  },
  {
    autor: 3, tipo: 5, status: [0, 'Recebida'], horasAtras: 120, norte: -14, leste: 11, likes: [2],
    descricao: 'Construção avançando sobre a margem do rio\nUma obra sem placa está aterrando a margem e derrubando a vegetação ciliar.',
    imagem: null, rua: 'Rua Beira Rio', numero: 35, bairro: 'Várzea', ponto: '',
  },
];

let ancora = null; // { latitude, longitude } - definida na primeira busca por localização

function semear(centro) {
  ancora = centro;
  const agora = Date.now();
  for (const ex of EXEMPLOS) {
    const latitude = centro.latitude + ex.norte / 111;
    const longitude = centro.longitude + ex.leste / (111 * Math.cos((centro.latitude * Math.PI) / 180));
    const id = banco.proximaDenuncia++;
    banco.denuncias.push({
      idDenuncia: id,
      descricao: ex.descricao,
      dataHora: dataLocal(new Date(agora - ex.horasAtras * 3600 * 1000)),
      imagem: ex.imagem ? imagem(ex.imagem) : null,
      video: null,
      codStatus: ex.status[0],
      descrStatus: ex.status[1],
      idUsuario: ex.autor,
      idTipoDenuncia: ex.tipo,
      endereco: {
        cep: '06500-000', estado: 'SP', cidade: 'Santana de Parnaíba', bairro: ex.bairro, rua: ex.rua,
        numero: ex.numero, pontoReferencia: ex.ponto, latitude: Number(latitude.toFixed(7)), longitude: Number(longitude.toFixed(7)),
      },
    });
    for (const idUsuario of ex.likes) banco.likes.push({ idUsuario, idDenuncia: id });
  }
}

// Usuários de exemplo (o primeiro é o de teste; os demais são autores das denúncias de exemplo)
const ana = novoUsuario('Ana Souza', 'ana@ecotec.app', 'ecotec123');
banco.enderecos.push({ idEndereco: banco.proximoEndereco++, cep: '06501-001', estado: 'SP', cidade: 'Santana de Parnaíba', bairro: 'Centro', rua: 'Rua Suzana Dias', idUsuario: ana.idUsuario });
novoUsuario('Bruno Carvalho', 'bruno@ecotec.app', 'ecotec123');
novoUsuario('Carla Mendes', 'carla@ecotec.app', 'ecotec123');
novoUsuario('Diego Ferreira', 'diego@ecotec.app', 'ecotec123');
novoUsuario('Elaine Prado', 'elaine@ecotec.app', 'ecotec123');

// ------------------------------------------------------------------ JWT (HS256)

const b64url = (dados) => Buffer.from(dados).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

function gerarToken(usuario) {
  const cabecalho = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const corpo = b64url(JSON.stringify({
    nameid: String(usuario.idUsuario), email: usuario.email, unique_name: usuario.nome,
    exp: Math.floor(Date.now() / 1000) + VALIDADE_DO_TOKEN_S,
  }));
  const assinatura = crypto.createHmac('sha256', SEGREDO).update(`${cabecalho}.${corpo}`).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${cabecalho}.${corpo}.${assinatura}`;
}

function usuarioDoToken(req) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');
  if (!/^bearer$/i.test(tipo || '') || !token) return null;
  const [h, c, a] = token.split('.');
  if (!h || !c || !a) return null;
  const esperada = crypto.createHmac('sha256', SEGREDO).update(`${h}.${c}`).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (esperada !== a) return null;
  try {
    const dados = JSON.parse(Buffer.from(c.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (!dados.exp || dados.exp * 1000 <= Date.now()) return null;
    return banco.usuarios.find((u) => u.idUsuario === Number(dados.nameid)) || null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------ utilidades HTTP

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function responder(res, status, corpo) {
  const cabecalhos = { ...CORS };
  let texto = '';
  if (corpo !== undefined) {
    texto = JSON.stringify(corpo);
    cabecalhos['Content-Type'] = 'application/json; charset=utf-8';
  }
  cabecalhos['Content-Length'] = Buffer.byteLength(texto);
  if (status === 401) cabecalhos['WWW-Authenticate'] = 'Bearer';
  res.writeHead(status, cabecalhos);
  res.end(texto);
  return status;
}

function lerCorpo(req) {
  return new Promise((resolver, rejeitar) => {
    const partes = [];
    let total = 0;
    req.on('data', (parte) => {
      total += parte.length;
      if (total > LIMITE_DO_CORPO) {
        rejeitar(Object.assign(new Error('Corpo grande demais'), { status: 413 }));
        req.destroy();
        return;
      }
      partes.push(parte);
    });
    req.on('end', () => {
      const texto = Buffer.concat(partes).toString('utf8');
      if (!texto) return resolver(null);
      try {
        resolver(JSON.parse(texto));
      } catch {
        rejeitar(Object.assign(new Error('JSON inválido'), { status: 400 }));
      }
    });
    req.on('error', rejeitar);
  });
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const texto = (v) => (typeof v === 'string' ? v : null);
const quantidadeLikes = (idDenuncia) => banco.likes.filter((l) => l.idDenuncia === idDenuncia).length;
const autor = (d) => {
  const u = banco.usuarios.find((x) => x.idUsuario === d.idUsuario);
  return { id: u.idUsuario, nome: u.nome };
};
const maisRecentes = (a, b) => (a.dataHora < b.dataHora ? 1 : -1);

// ------------------------------------------------------------------ rotas (iguais às do back-end)

async function tratar(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const caminho = url.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const metodo = req.method.toUpperCase();
  let m;

  if (metodo === 'OPTIONS') return responder(res, 204);

  if (metodo === 'GET' && caminho === '/swagger/v1/swagger.json') {
    return responder(res, 200, { openapi: '3.0.1', info: { title: 'EcoTec API simulada', version: '1.0' } });
  }

  // ---- POST /auth/login
  if (metodo === 'POST' && caminho === '/auth/login') {
    const corpo = (await lerCorpo(req)) || {};
    if (!corpo.email || !corpo.senha) return responder(res, 400, 'Email e senha são obrigatórios');
    const usuario = banco.usuarios.find((u) => u.email === corpo.email);
    if (!usuario || usuario.senhaHash !== hash(corpo.senha)) return responder(res, 401);
    return responder(res, 200, {
      token: gerarToken(usuario),
      usuario: { idUsuario: usuario.idUsuario, nome: usuario.nome, email: usuario.email },
    });
  }

  // ---- POST /usuario (sem autenticação)
  if (metodo === 'POST' && caminho === '/usuario') {
    const corpo = (await lerCorpo(req)) || {};
    if (!texto(corpo.nome) || !texto(corpo.email) || !texto(corpo.senha)) return responder(res, 400);
    novoUsuario(corpo.nome, corpo.email, corpo.senha);
    return responder(res, 200);
  }

  // ---- daqui para baixo, tudo exige token (RequireAuthorization)
  const protegida = caminho === '/usuario' || caminho.startsWith('/usuario/') || caminho.startsWith('/endereco') || caminho.startsWith('/denuncia');
  if (!protegida) return responder(res, 404);
  const usuario = usuarioDoToken(req);
  if (!usuario) return responder(res, 401);

  // ---- GET /usuario/{id}
  if (metodo === 'GET' && (m = /^\/usuario\/(\d+)$/.exec(caminho))) {
    const achado = banco.usuarios.find((u) => u.idUsuario === Number(m[1]));
    if (!achado) return responder(res, 404, { mensagem: 'Usuário não encontrado' });
    const endereco = banco.enderecos.find((e) => e.idUsuario === achado.idUsuario) || null;
    return responder(res, 200, { mensagem: 'Usuário encontrado', dados: { ...achado, endereco } });
  }

  // ---- POST /endereco
  if (metodo === 'POST' && caminho === '/endereco') {
    const corpo = (await lerCorpo(req)) || {};
    if (banco.enderecos.some((e) => e.idUsuario === Number(corpo.idUsuario))) {
      return responder(res, 400, 'Usuário já possui um endereço cadastrado.');
    }
    for (const campo of ['cep', 'estado', 'cidade', 'bairro', 'rua']) {
      if (texto(corpo[campo]) === null) return responder(res, 500); // NOT NULL no banco real
    }
    banco.enderecos.push({
      idEndereco: banco.proximoEndereco++, cep: corpo.cep, estado: corpo.estado, cidade: corpo.cidade,
      bairro: corpo.bairro, rua: corpo.rua, idUsuario: Number(corpo.idUsuario),
    });
    return responder(res, 200);
  }

  // ---- GET /endereco/{idUsuario}
  if (metodo === 'GET' && (m = /^\/endereco\/(\d+)$/.exec(caminho))) {
    const endereco = banco.enderecos.find((e) => e.idUsuario === Number(m[1]));
    if (!endereco) return responder(res, 404, 'Endereço não foi encontrado.');
    return responder(res, 200, endereco);
  }

  // ---- POST /denuncia
  if (metodo === 'POST' && caminho === '/denuncia') {
    const corpo = await lerCorpo(req);
    const e = corpo && corpo.endereco;
    const valido = corpo && texto(corpo.descricao) !== null && Number.isInteger(corpo.idTipoDenuncia) && e &&
      typeof e.latitude === 'number' && typeof e.longitude === 'number' && Number.isInteger(e.numero) &&
      (corpo.imagem === null || corpo.imagem === undefined || typeof corpo.imagem === 'string') &&
      (corpo.video === null || corpo.video === undefined || typeof corpo.video === 'string');
    if (!valido) return responder(res, 400); // o ASP.NET recusa o JSON que não bate com o DenunciaRequest
    for (const campo of ['cep', 'estado', 'cidade', 'bairro', 'rua', 'pontoReferencia']) {
      if (texto(e[campo]) === null) return responder(res, 500); // colunas NOT NULL no banco real
    }
    if (!TIPOS[corpo.idTipoDenuncia]) return responder(res, 500); // chave estrangeira inexistente
    const base64 = /^[A-Za-z0-9+/]*={0,2}$/;
    if ((corpo.imagem && !base64.test(corpo.imagem)) || (corpo.video && !base64.test(corpo.video))) return responder(res, 400);

    const denuncia = {
      idDenuncia: banco.proximaDenuncia++,
      descricao: corpo.descricao,
      dataHora: dataLocal(new Date()),
      imagem: corpo.imagem || null,
      video: corpo.video || null,
      codStatus: 1,
      descrStatus: 'Em análise',
      idUsuario: usuario.idUsuario,
      idTipoDenuncia: corpo.idTipoDenuncia,
      endereco: {
        cep: e.cep, estado: e.estado, cidade: e.cidade, bairro: e.bairro, rua: e.rua, numero: e.numero,
        pontoReferencia: e.pontoReferencia, latitude: e.latitude, longitude: e.longitude,
      },
    };
    banco.denuncias.push(denuncia);
    return responder(res, 201, { mensagem: 'Denúncia cadastrada com sucesso.', id: denuncia.idDenuncia });
  }

  // ---- GET /denuncia?latitude&longitude&raioKm
  if (metodo === 'GET' && caminho === '/denuncia') {
    const latitude = Number(url.searchParams.get('latitude'));
    const longitude = Number(url.searchParams.get('longitude'));
    const raioKm = Number(url.searchParams.get('raioKm'));
    if (![latitude, longitude, raioKm].every(Number.isFinite) || !url.searchParams.has('latitude')) return responder(res, 400);
    if (latitude < -90 || latitude > 90) return responder(res, 400, { mensagem: 'Latitude inválida. Utilize um valor entre -90 e 90.' });
    if (longitude < -180 || longitude > 180) return responder(res, 400, { mensagem: 'Longitude inválida. Utilize um valor entre -180 e 180.' });
    if (raioKm <= 0 || raioKm > 100) return responder(res, 400, { mensagem: 'O raio deve ser maior que zero e menor ou igual a 100 km.' });

    if (!ancora) semear({ latitude, longitude }); // as denúncias de exemplo nascem em volta de quem consultou primeiro

    const lista = banco.denuncias
      .filter((d) => distanciaKm(latitude, longitude, d.endereco.latitude, d.endereco.longitude) <= raioKm)
      .sort(maisRecentes)
      .map((d) => ({
        id: d.idDenuncia, descricao: d.descricao, dataHora: d.dataHora, imagem: d.imagem, video: d.video,
        status: d.descrStatus, usuario: autor(d), tipo: TIPOS[d.idTipoDenuncia],
        endereco: {
          cidade: d.endereco.cidade, bairro: d.endereco.bairro, rua: d.endereco.rua, numero: d.endereco.numero,
          latitude: d.endereco.latitude, longitude: d.endereco.longitude,
        },
        quantidadeLikes: quantidadeLikes(d.idDenuncia),
      }));
    return responder(res, 200, lista);
  }

  // ---- GET /denuncia/minhasDenuncias
  if (metodo === 'GET' && caminho === '/denuncia/minhasdenuncias') {
    const lista = banco.denuncias
      .filter((d) => d.idUsuario === usuario.idUsuario)
      .sort(maisRecentes)
      .map((d) => ({
        id: d.idDenuncia, descricao: d.descricao, dataHora: d.dataHora, imagem: d.imagem, video: d.video,
        status: d.descrStatus, tipo: TIPOS[d.idTipoDenuncia],
        endereco: { cidade: d.endereco.cidade, bairro: d.endereco.bairro, rua: d.endereco.rua, numero: d.endereco.numero },
        quantidadeLikes: quantidadeLikes(d.idDenuncia),
      }));
    return responder(res, 200, lista);
  }

  // ---- GET /denuncia/{id}
  if (metodo === 'GET' && (m = /^\/denuncia\/(\d+)$/.exec(caminho))) {
    const d = banco.denuncias.find((x) => x.idDenuncia === Number(m[1]));
    if (!d) return responder(res, 404, { mensagem: 'Denúncia não encontrada.' });
    return responder(res, 200, {
      id: d.idDenuncia, descricao: d.descricao, dataHora: d.dataHora, imagem: d.imagem, video: d.video,
      status: d.descrStatus, usuario: autor(d), tipo: TIPOS[d.idTipoDenuncia],
      endereco: { ...d.endereco }, quantidadeLikes: quantidadeLikes(d.idDenuncia),
    });
  }

  // ---- POST e DELETE /denuncia/{id}/like
  if ((m = /^\/denuncia\/(\d+)\/like$/.exec(caminho)) && (metodo === 'POST' || metodo === 'DELETE')) {
    const idDenuncia = Number(m[1]);
    const indice = banco.likes.findIndex((l) => l.idUsuario === usuario.idUsuario && l.idDenuncia === idDenuncia);
    if (metodo === 'POST') {
      if (!banco.denuncias.some((d) => d.idDenuncia === idDenuncia)) return responder(res, 404, { mensagem: 'Denúncia não encontrada.' });
      if (indice >= 0) return responder(res, 400, { mensagem: 'Você já curtiu esta denúncia.' });
      banco.likes.push({ idUsuario: usuario.idUsuario, idDenuncia });
      return responder(res, 200, { mensagem: 'Curtida realizada com sucesso.' });
    }
    if (indice < 0) return responder(res, 404, { mensagem: 'Você ainda não curtiu esta denúncia.' });
    banco.likes.splice(indice, 1);
    return responder(res, 200, { mensagem: 'Curtida removida com sucesso.' });
  }

  return responder(res, 404);
}

// ------------------------------------------------------------------ servidor

const servidor = http.createServer((req, res) => {
  const inicio = Date.now();
  tratar(req, res)
    .catch((erro) => responder(res, erro.status || 500))
    .then((status) => {
      if (req.method !== 'OPTIONS') {
        console.log(`${new Date().toLocaleTimeString('pt-BR')}  ${String(status).padEnd(3)}  ${req.method.padEnd(6)} ${req.url}  (${Date.now() - inicio} ms)`);
      }
    });
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`\nA porta ${PORTA} já está em uso (o back-end real está rodando?).\nEncerre o outro programa ou use outra porta:  PORT=5261 node scripts/api-simulada.js\n`);
    process.exit(1);
  }
  throw erro;
});

servidor.listen(PORTA, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log('\nAPI simulada do EcoTec no ar (dados somente na memória).');
  console.log(`  Neste computador:  http://localhost:${PORTA}`);
  for (const ip of ips) console.log(`  Na rede Wi-Fi:     http://${ip}:${PORTA}`);
  console.log('\n  Usuário de exemplo:  ana@ecotec.app  /  ecotec123');
  console.log('  Para encerrar: Ctrl + C\n');
});
