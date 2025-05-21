// src/matrix.ts
import { encodePayloadToCodewords } from './encoder'

// Posições dos 15 format bits
export const formatPositions1: [number, number][] = [
  [8, 0],  [8, 1],  [8, 2],  [8, 3],  [8, 4],  [8, 5],  [8, 7],
  [8, 8],  [7, 8],  [5, 8],  [4, 8],  [3, 8],  [2, 8],  [1, 8],  [0, 8],
]
export const formatPositions2: [number, number][] = [
  [24, 8], [23, 8], [22, 8], [21, 8], [20, 8], [19, 8], [18, 8],
  [8, 17], [8, 18], [8, 19], [8, 20], [8, 21], [8, 22], [8, 23], [8, 24],
]

/**
 * Constrói a matriz final (0|1) do QR Code versão 2, nível H.
 */
export function buildMatrix(codewords: number[]): (0|1)[][] {
  const N = 21 + 4  // base 21 + 2 módulos de borda (quiet-zone interno)
  // inicializa tudo com null
  const M: (0|1|null)[][] = Array.from(
    { length: N },
    () => new Array<0|1|null>(N).fill(null)
  )

  // 1) desenha padrões, separadores, timing e alignment
  placeFindersAlignmentAndTiming(M)
  placeFormatInfoAreas(M)

  // 2) extrai bits dos codewords
  const bits: number[] = []
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) {
      bits.push((cw >> i) & 1)
    }
  }

  // 3) preenche em zig-zag, colunas de 2 em 2, pulando a coluna 6
  let bitIdx = 0
  let upward = true
  for (let col = N - 1; col > 0; col -= 2) {
    if (col === 6) continue  // pula a coluna de timing
    if (upward) {
      for (let row = N - 1; row >= 0; row--) {
        fillModules(row, col)
      }
    } else {
      for (let row = 0; row < N; row++) {
        fillModules(row, col)
      }
    }
    upward = !upward
  }

  // 4) aplica máscara 0: inverte quando (r+c)%2===0
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (M[r][c] !== null && ((r + c) % 2 === 0)) {
        M[r][c] = (M[r][c]! ^ 1) as 0|1
      }
    }
  }

  // 5) insere os 15 format bits (0b111011111000100)
  const formatBits = 0b111011111000100
  for (let i = 0; i < 15; i++) {
    const b = ((formatBits >> i) & 1) as 0|1
    const [r1, c1] = formatPositions1[i]
    const [r2, c2] = formatPositions2[i]
    M[r1][c1] = b
    M[r2][c2] = b
  }

  // 6) retorna com null removidos
  return M.map(row => row.map(v => v!))

  // ——— funções auxiliares ———

  function fillModules(r: number, c: number) {
    // tenta preencher c e c-1 se forem null e houver bits sobrando
    if (M[r][c] === null && bitIdx < bits.length) {
      M[r][c] = bits[bitIdx++] as 0|1
    }
    if (M[r][c - 1] === null && bitIdx < bits.length) {
      M[r][c - 1] = bits[bitIdx++] as 0|1
    }
  }
}

function placeFindersAlignmentAndTiming(M: (0|1|null)[][]) {
  const N = M.length
  const fpCoords: [number,number][] = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ]

  for (const [ry, cx] of fpCoords) {
    // Finder 7×7
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        M[ry + y][cx + x] = 1
      }
    }
    // interior em branco
    for (let y = 1; y < 6; y++) {
      for (let x = 1; x < 6; x++) {
        M[ry + y][cx + x] = 0
      }
    }
    // centro 3×3 escuro
    for (let y = 2; y < 5; y++) {
      for (let x = 2; x < 5; x++) {
        M[ry + y][cx + x] = 1
      }
    }

    // Separadores (linha acima e abaixo)
    for (let dx = -1; dx <= 7; dx++) {
      const c = cx + dx
      const rAbove = ry - 1
      const rBelow = ry + 7
      if (rAbove >= 0 && c >= 0 && c < N) M[rAbove][c] = 0
      if (rBelow < N   && c >= 0 && c < N) M[rBelow][c] = 0
    }
    // Separadores (colunas esquerda e direita)
    for (let dy = -1; dy <= 7; dy++) {
      const r = ry + dy
      const cLeft  = cx - 1
      const cRight = cx + 7
      if (r >= 0 && r < N) {
        if (cLeft  >= 0)    M[r][cLeft]  = 0
        if (cRight < N)     M[r][cRight] = 0
      }
    }
  }

  // Timing patterns (linha 6 e coluna 6)
  for (let i = 8; i < N - 8; i++) {
    M[6][i]   = (i % 2 ? 1 : 0) as 0|1
    M[i][6]   = (i % 2 ? 1 : 0) as 0|1
  }

  // Alignment pattern versão 2 no canto inferior direito
  const ap = N - 8 - 1
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const v = (y === 0 || y === 4 || x === 0 || x === 4 || (y === 2 && x === 2))
        ? 1 : 0
      M[ap + y][ap + x] = v as 0|1
    }
  }

  // Dark module
  M[8][4*2 + 9] = 1
}

/** Reserva as células dos 15 format bits para preenchimento após */
function placeFormatInfoAreas(M: (0|1|null)[][]) {
  for (const [r, c] of formatPositions1) M[r][c] = null
  for (const [r, c] of formatPositions2) M[r][c] = null
}
