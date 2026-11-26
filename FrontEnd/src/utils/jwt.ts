const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodificarBase64Url(texto: string): string {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let saida = '';
  let acumulado = 0;
  let bits = 0;
  for (const letra of base64) {
    const valor = ALFABETO.indexOf(letra);
    if (valor < 0) continue;
    acumulado = (acumulado << 6) | valor;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      saida += String.fromCharCode((acumulado >> bits) & 255);
    }
  }
  return saida;
}

/** Momento (em milissegundos) em que o token JWT expira, ou null se não for possível ler. */
export function expiracaoDoToken(token: string): number | null {
  try {
    const corpo = decodificarBase64Url(token.split('.')[1] ?? '');
    const achado = /"exp"\s*:\s*(\d+)/.exec(corpo);
    return achado ? Number(achado[1]) * 1000 : null;
  } catch {
    return null;
  }
}

export function tokenExpirado(token: string, agora: number = Date.now()): boolean {
  const expira = expiracaoDoToken(token);
  return expira !== null && expira <= agora;
}
