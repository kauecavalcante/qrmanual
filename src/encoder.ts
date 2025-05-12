import { reedSolomon } from './rs'

export function encodePayloadToCodewords(payload: string): number[] {
  const maxDataCW = 34
  const bytes = Array.from(new TextEncoder().encode(payload))
  if (bytes.length > maxDataCW - 2) {
    throw new Error(`Payload muito grande (${bytes.length} bytes).`)
  }

  // 1) Modo byte + comprimento + dados
  const bits: number[] = []
  bits.push(0,1,0,0)
  for (let i = 7; i >= 0; i--) bits.push((bytes.length >> i) & 1)
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  }

  // 2) Terminator + padding
  for (let i = 0; i < 4 && bits.length < maxDataCW*8; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)

  // 3) Data codewords
  const dataCW: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v<<1) | bits[i+j]
    dataCW.push(v)
  }

  // 4) Pad bytes alternados
  const padBytes = [0xec, 0x11]
  let pi = 0
  while (dataCW.length < maxDataCW) {
    dataCW.push(padBytes[pi % 2])
    pi++
  }

  // 5) ECC
  const ecc = reedSolomon(dataCW, 10)
  return dataCW.concat(ecc)
}
