// src/rs.ts
import { EXP_TABLE, gfMul } from './gf'

export function reedSolomon(data: number[], degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], EXP_TABLE[i])
      next[j+1] ^= poly[j]
    }
    poly = next
  }

  const res = new Array(degree).fill(0)
  for (const b of data) {
    const factor = b ^ res.shift()!
    res.push(0)
    if (factor !== 0) {
      for (let i = 0; i < degree; i++) {
        res[i] ^= gfMul(poly[poly.length - 1 - i], factor)
      }
    }
  }
  return res
}
