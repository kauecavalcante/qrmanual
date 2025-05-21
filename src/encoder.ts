// src/encoder.ts
export function encodePayloadToCodewords(payload: string): number[] {
  const maxDataCW = 34      // código de versão QR 2, level H = 34 data codewords
  const bytes = Array.from(new TextEncoder().encode(payload))
  if (bytes.length > maxDataCW - 2) {
    throw new Error(`Payload muito grande (${bytes.length} bytes).`)
  }

  // 1) Byte Mode indicator + length
  const bits: number[] = []
  bits.push(0,1,0,0)
  for (let i = 7; i >= 0; i--) bits.push((bytes.length >> i) & 1)
  // 2) Payload
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  }

  // 3) Terminator (até 4 zeros) + alinhar ao múltiplo de 8
  for (let i = 0; i < 4 && bits.length < maxDataCW*8; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)

  // 4) Data codewords
  const dataCW: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]
    dataCW.push(v)
  }

  // 5) Pad bytes alternados 0xEC / 0x11
  const padBytes = [0xec,0x11]
  let p = 0
  while (dataCW.length < maxDataCW) {
    dataCW.push(padBytes[p % 2])
    p++
  }

  // 6) ECC codewords
  const { reedSolomon } = require('./rs')
  const ecc = reedSolomon(dataCW, 10)    // 10 ECC CW para versão 2-H

  return dataCW.concat(ecc)
}
