import { buildMatrix } from './matrix'
import { encodePayloadToCodewords } from './encoder'

export function renderSVG(matrix: (0|1)[][], scale = 4): string {
  const N = matrix.length
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N*scale}" height="${N*scale}" viewBox="0 0 ${N} ${N}">`
  svg += `<rect width="100%" height="100%" fill="#fff"/>`
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (matrix[y][x] === 1) {
        svg += `<rect x="${x}" y="${y}" width="1" height="1"/>`
      }
    }
  }
  svg += `</svg>`
  return svg
}

export function generateQRCodeSVG(payload: string): string {
  const cw = encodePayloadToCodewords(payload)
  const matrix = buildMatrix(cw)
  return renderSVG(matrix)
}
