// Posições reservadas para os 15 format bits
export const formatPositions1: [number,number][] = [
  [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],
  [8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]
]
export const formatPositions2: [number,number][] = [
  [24,8],[23,8],[22,8],[21,8],[20,8],[19,8],[18,8],
  [8,17],[8,18],[8,19],[8,20],[8,21],[8,22],[8,23],[8,24]
]

function placeFindersAlignmentAndTiming(M: (0|1|null)[][]): void {
  const N = M.length
  const fpCoords: [number,number][] = [[0,0],[N-7,0],[0,N-7]]

  // Finder patterns
  for (const [ry,cx] of fpCoords) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        M[ry+y][cx+x] = 1
      }
    }
    for (let y = 1; y < 6; y++) {
      for (let x = 1; x < 6; x++) {
        M[ry+y][cx+x] = 0
      }
    }
    for (let y = 2; y < 5; y++) {
      for (let x = 2; x < 5; x++) {
        M[ry+y][cx+x] = 1
      }
    }
  }

  // Separators (branco)
  for (const [ry,cx] of fpCoords) {
    for (let xOff = -1; xOff <= 7; xOff++) {
      const r1 = ry - 1, r2 = ry + 7, c = cx + xOff
      if (r1 >= 0 && c >= 0 && c < N) M[r1][c] = 0
      if (r2 < N && c >= 0 && c < N) M[r2][c] = 0
    }
    for (let yOff = -1; yOff <= 7; yOff++) {
      const r = ry + yOff, c1 = cx - 1, c2 = cx + 7
      if (r >= 0 && r < N && c1 >= 0) M[r][c1] = 0
      if (r >= 0 && r < N && c2 < N) M[r][c2] = 0
    }
  }

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    M[6][i] = (i % 2 ? 1 : 0) as 0|1
    M[i][6] = (i % 2 ? 1 : 0) as 0|1
  }

  // Alignment v2 em (18,18)
  const ap = N - 8 - 1
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const v = (y === 0 || y === 4 || x === 0 || x === 4) ? 1 : (y === 2 && x === 2 ? 1 : 0)
      M[ap+y][ap+x] = v as 0|1
    }
  }

  // Dark module
  M[8][4*2 + 9] = 1
}

function placeFormatInfoAreas(M: (0|1|null)[][]): void {
  for (const [r,c] of formatPositions1) M[r][c] = null
  for (const [r,c] of formatPositions2) M[r][c] = null
}

export function buildMatrix(codewords: number[]): (0|1)[][] {
  const N = 21 + 4
  const M: (0|1|null)[][] = Array.from({length: N}, () => Array.from({length: N}, () => null))

  placeFindersAlignmentAndTiming(M)
  placeFormatInfoAreas(M)

  // Extrai bits
  const bits: number[] = []
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1)
  }

  // Preenche zig-zag
  let bitIdx = 0
  let upward = true
  for (let col = N - 1; col > 0; col -= 2) {
    if (col === 6) col--
    if (upward) {
      for (let row = N - 1; row >= 0; row--) {
        for (let dx = 0; dx < 2; dx++) {
          const c = col - dx
          if (M[row][c] === null && bitIdx < bits.length) {
            M[row][c] = bits[bitIdx++] as 0|1
          }
        }
      }
    } else {
      for (let row = 0; row < N; row++) {
        for (let dx = 0; dx < 2; dx++) {
          const c = col - dx
          if (M[row][c] === null && bitIdx < bits.length) {
            M[row][c] = bits[bitIdx++] as 0|1
          }
        }
      }
    }
    upward = !upward
  }

  // Aplica máscara 0
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (M[r][c] !== null && ((r + c) % 2 === 0)) {
        M[r][c] = (M[r][c]! ^ 1) as 0|1
      }
    }
  }

  // Insere format bits (0b111011111000100)
  const formatBits = 0b111011111000100
  for (let i = 0; i < 15; i++) {
    const b = ((formatBits >> i) & 1) as 0|1
    const [r1,c1] = formatPositions1[i]
    const [r2,c2] = formatPositions2[i]
    M[r1][c1] = b
    M[r2][c2] = b
  }

  // Remove nulls e retorna matriz final
  return M.map(row => row.map(v => v!))
}
