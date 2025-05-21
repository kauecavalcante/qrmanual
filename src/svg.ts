import { buildMatrix } from './matrix'

export interface SVGOptions {
  scale?: number
  margin?: number
  backgroundColor?: string
  foregroundColor?: string
}

export function renderSVG(
  matrix: (0|1)[][],
  options: SVGOptions = {}
): string {
  const n = matrix.length
  const scale = Math.floor(options.scale ?? 10)
  const margin = Math.floor(options.margin ?? 4)
  const bg = options.backgroundColor ?? '#fff'
  const fg = options.foregroundColor ?? '#000'
  const total = n + margin * 2
  const px = total * scale

  let svg = `<?xml version="1.0" encoding="UTF-8"?>`
  svg += `<svg xmlns="http://www.w3.org/2000/svg"`
  svg += ` width="${px}" height="${px}"`
  svg += ` shape-rendering="crispEdges">`
  svg += `<rect width="${px}" height="${px}" fill="${bg}" />`

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x] === 1) {
        svg += `<rect x="${(x+margin)*scale}" y="${(y+margin)*scale}"`
        svg += ` width="${scale}" height="${scale}" fill="${fg}" />`
      }
    }
  }

  svg += `</svg>`
  return svg
}

export function generateQRCodeSVG(
  payload: string,
  options?: SVGOptions
): string {
  const codewords = require('./encoder').encodePayloadToCodewords(payload)
  const matrix = buildMatrix(codewords)
  return renderSVG(matrix, options)
}
