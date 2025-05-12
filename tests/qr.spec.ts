import { generateQRCodeSVG } from '../src/svg'

test('gera SVG contendo <svg>', () => {
  const svg = generateQRCodeSVG('oi')
  expect(svg).toMatch(/^<svg/)
  expect(svg).toContain('</svg>')
})
