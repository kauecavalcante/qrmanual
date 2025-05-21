// 1) Cria as duas tabelas como instâncias de Uint8Array
export const EXP_TABLE = new Uint8Array(512)
export const LOG_TABLE = new Uint8Array(256)

// 2) Inicializa o campo de Galois (tiros da biblioteca padrão)
;(function initGF(): void {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x
    LOG_TABLE[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255]
  }
})()

// 3) Multiplicação em GF(256)
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  const idx = LOG_TABLE[a] + LOG_TABLE[b]
  return EXP_TABLE[idx]
}
