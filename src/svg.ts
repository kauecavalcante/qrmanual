import { buildMatrix } from './matrix'
import { encodePayloadToCodewords } from './encoder'

export interface SVGOptions {
  /** Quantos pixels por módulo */
  scale?: number
  /** Quiet‐zone em módulos */
  margin?: number
  /** Cor de fundo */
  backgroundColor?: string
  /** Cor dos módulos */
  foregroundColor?: string
}

/**
 * Renderiza a matriz de QR em um SVG pixel‐perfeito.
 */
export function renderSVG(
  matrix: (0 | 1)[][],
  options: SVGOptions = {}
): string {
  const N = matrix.length
  const scale = Math.floor(options.scale ?? 10)      // inteiro: 10px por módulo
  const margin = Math.floor(options.margin ?? 4)     // 4 módulos de quiet‐zone
  const bg = options.backgroundColor ?? '#FFFFFF'
  const fg = options.foregroundColor ?? '#000000'

  const totalModules = N + margin * 2
  const sizePx = totalModules * scale               // width/height em px

  // Inicia SVG com crispEdges
  let svg = `<?xml version="1.0" encoding="UTF-8"?>`
  svg += `<svg xmlns="http://www.w3.org/2000/svg"`
  svg += ` width="${sizePx}" height="${sizePx}"`
  svg += ` viewBox="0 0 ${totalModules} ${totalModules}"`
  svg += ` shape-rendering="crispEdges">`

  // Fundo
  svg += `<rect width="${totalModules}" height="${totalModules}" fill="${bg}" />`

  // Desenha módulos
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (matrix[y][x] === 1) {
        svg += `<rect x="${x + margin}" y="${y + margin}"`
        svg += ` width="1" height="1" fill="${fg}" />`
      }
    }
  }

  svg += `</svg>`
  return svg
}

/**
 * Gera QR Code em SVG pronto para leitura perfeita.
 */
export function generateQRCodeSVG(
  payload: string,
  options?: SVGOptions
): string {
  const codewords = encodePayloadToCodewords(payload)
  const matrix = buildMatrix(codewords)
  return renderSVG(matrix, options)
}
