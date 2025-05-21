import { generateQRCodeSVG } from '../src/svg'

test('gera SVG contendo <svg>', () => {
  const svg = generateQRCodeSVG('oi')

  // aceita opcionalmente a declaração XML antes da tag <svg>
  expect(svg).toMatch(/^(<\?xml.*?\?>)?<svg/)
  expect(svg).toContain('</svg>')
})
