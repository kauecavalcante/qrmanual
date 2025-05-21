// src/matrix.ts
import { encodePayloadToCodewords } from './encoder'

export const formatPositions1: [number,number][] = [
  [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],
  [8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]
]
export const formatPositions2: [number,number][] = [
  [24,8],[23,8],[22,8],[21,8],[20,8],[19,8],[18,8],
  [8,17],[8,18],[8,19],[8,20],[8,21],[8,22],[8,23],[8,24]
]

export function buildMatrix(codewords: number[]): (0|1)[][] {
  const N = 21 + 4   // versão 2 → 21 + 2*2 de alinhamento/timing
  const M: (0|1|null)[][] = Array.from({length:N},()=>Array(N).fill(null))

  // 1) Finder + separators + timing patterns + alignment
  placeFindersAlignmentAndTiming(M)
  placeFormatInfoAreas(M)

  // 2) Bits
  const bits: number[] = []
  for (const cw of codewords) {
    for (let i = 7; i >= 0; i--) bits.push((cw >> i)&1)
  }

  // 3) Zig-zag fill
  let bitIdx=0, upward=true
  for (let col=N-1; col>0; col-=2) {
    if (col===6) col--
    if (upward) {
      for (let row=N-1; row>=0; row--) fillCell(row,col)
    } else {
      for (let row=0; row<N; row++) fillCell(row,col)
    }
    upward = !upward
  }

  // 4) Apply mask 0: (r+c)%2===0
  for (let r=0;r<N;r++){
    for(let c=0;c<N;c++){
      if(M[r][c]!==null && (r+c)%2===0) M[r][c]= (M[r][c]! ^ 1) as 0|1
    }
  }

  // 5) Insert format bits (0b111011111000100)
  const formatBits = 0b111011111000100
  for (let i=0;i<15;i++){
    const b = ((formatBits>>i)&1) as 0|1
    const [r1,c1]=formatPositions1[i]
    const [r2,c2]=formatPositions2[i]
    M[r1][c1]=b; M[r2][c2]=b
  }

  // convert to non-nullable
  return M.map(row=>row.map(v=>v!))

  function fillCell(r:number,c:number){
    for(let dx=0;dx<2;dx++){
      const cc=c-dx
      if (M[r][cc]===null && bitIdx<bits.length) {
        M[r][cc] = bits[bitIdx++] as 0|1
      }
    }
  }
}

function placeFindersAlignmentAndTiming(M:(0|1|null)[][]){
  const N=M.length, fp=[[0,0],[N-7,0],[0,N-7]] as [number,number][]
  for(const [ry,cx] of fp){
    // finder
    for(let y=0;y<7;y++)for(let x=0;x<7;x++)M[ry+y][cx+x]=1
    for(let y=1;y<6;y++)for(let x=1;x<6;x++)M[ry+y][cx+x]=0
    for(let y=2;y<5;y++)for(let x=2;x<5;x++)M[ry+y][cx+x]=1
    // separators
    for(let x=-1;x<=7;x++){
      if(ry-1>=0) M[ry-1][cx+x]=0
      if(ry+7<N) M[ry+7][cx+x]=0
    }
    for(let y=-1;y<=7;y++){
      if(cx-1>=0) M[ry+y][cx-1]=0
      if(cx+7<N) M[ry+y][cx+7]=0
    }
  }
  // timing
  for(let i=8;i<N-8;i++){
    M[6][i]= (i%2?1:0) as 0|1
    M[i][6]= (i%2?1:0) as 0|1
  }
  // alignment center (versão 2)
  const ap=N-8-1
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){
    const v=(y===0||y===4||x===0||x===4|| (y===2&&x===2))?1:0
    M[ap+y][ap+x]=v as 0|1
  }
  // dark module
  M[8][4*2+9]=1
}

function placeFormatInfoAreas(M:(0|1|null)[][]){
  for(const p of formatPositions1)M[p[0]][p[1]] = null
  for(const p of formatPositions2)M[p[0]][p[1]] = null
}
