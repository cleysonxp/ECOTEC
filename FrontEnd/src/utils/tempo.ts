/** Rejeita a promessa se ela não terminar dentro do prazo (em milissegundos). */
export function comTempoLimite<T>(promessa: Promise<T>, prazo: number): Promise<T> {
  return new Promise<T>((resolver, rejeitar) => {
    const temporizador = setTimeout(() => rejeitar(new Error('Tempo esgotado.')), prazo);
    promessa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolver(valor);
      },
      (erro) => {
        clearTimeout(temporizador);
        rejeitar(erro);
      },
    );
  });
}
